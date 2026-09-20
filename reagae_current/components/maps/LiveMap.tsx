"use client";
import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

type Point={latitude:number;longitude:number};
export default function LiveMap({point,pickup,destination,height=420}:{point?:Point;pickup?:Point;destination?:Point;height?:number}){
 const ref=useRef<HTMLDivElement>(null);const mapRef=useRef<any>(null);const markerRef=useRef<any>(null);const routeRef=useRef<any>(null);
 useEffect(()=>{let disposed=false;const load=async()=>{
   if(!document.getElementById("leaflet-css")){const l=document.createElement("link");l.id="leaflet-css";l.rel="stylesheet";l.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(l)}
   if(!(window as any).L){await new Promise<void>(resolve=>{const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";s.onload=()=>resolve();document.head.appendChild(s)})}
   if(disposed||!ref.current)return;const L=(window as any).L;const center=point||pickup||destination||{latitude:-26.2041,longitude:28.0473};
   if(!mapRef.current){mapRef.current=L.map(ref.current,{zoomControl:true,scrollWheelZoom:false}).setView([center.latitude,center.longitude],12);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(mapRef.current)}
   if(point){if(!markerRef.current)markerRef.current=L.marker([point.latitude,point.longitude]).addTo(mapRef.current);else markerRef.current.setLatLng([point.latitude,point.longitude]);markerRef.current.bindPopup("Live vehicle location")}
   if(pickup&&destination){try{const r=await fetch(`https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`);const d=await r.json();if(!disposed&&d.routes?.[0]?.geometry?.coordinates){if(routeRef.current)routeRef.current.remove();const coords=d.routes[0].geometry.coordinates.map((x:number[])=>[x[1],x[0]]);routeRef.current=L.polyline(coords,{weight:6,opacity:.82}).addTo(mapRef.current);mapRef.current.fitBounds(routeRef.current.getBounds(),{padding:[30,30]})}}catch{/* map still shows the two points */}}
   if(pickup&&!mapRef.current.__pickup){L.circleMarker([pickup.latitude,pickup.longitude],{radius:7}).addTo(mapRef.current).bindPopup("Pickup");mapRef.current.__pickup=true}
   if(destination&&!mapRef.current.__destination){L.circleMarker([destination.latitude,destination.longitude],{radius:7}).addTo(mapRef.current).bindPopup("Destination");mapRef.current.__destination=true}
 };load();return()=>{disposed=true}},[point?.latitude,point?.longitude,pickup?.latitude,pickup?.longitude,destination?.latitude,destination?.longitude]);
 return <Box ref={ref} sx={{height,borderRadius:4,overflow:"hidden",border:"1px solid",borderColor:"divider",background:"#e8edf4"}}/>;
}
