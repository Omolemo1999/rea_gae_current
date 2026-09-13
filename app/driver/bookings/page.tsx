"use client";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";
import { useEffect,useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import BookingStatusChip from "@/components/bookings/BookingStatusChip";
import type { Booking } from "@/types/booking";import RideSafetyActions from "@/components/safety/RideSafetyActions";

export default function DriverBookings(){const [items,setItems]=useState<Booking[]>([]);const [msg,setMsg]=useState("");
const load=()=>fetch("/api/bookings").then(r=>r.json()).then(d=>setItems(d.bookings||[]));useEffect(() => { load(); }, []);
const act=async(id:string,status:"ACCEPTED"|"REJECTED")=>{const r=await fetch(`/api/bookings/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});const d=await r.json();if(!r.ok){setMsg(d.error);return;}load();};
return <AuthGuard role="DRIVER"><DashboardShell role="DRIVER"><Typography variant="h3">Booking requests</Typography>{msg&&<Alert sx={{mt:2}} severity="error">{msg}</Alert>}<Stack gap={2} sx={{mt:3}}>{items.map(b=><Paper key={b.id} elevation={0} sx={{p:3,border:"1px solid #E5EAF2"}}><Stack direction="row" justifyContent="space-between"><Typography fontWeight={800}>Booking {b.id.slice(-6)}</Typography><BookingStatusChip status={b.status}/></Stack><Typography sx={{mt:1,color:"text.secondary"}}>{b.seatsRequested} seat(s) · {b.bags} bag(s) · Collection: {b.collectionSpotName||"Public point"}</Typography>{b.status==="REQUESTED"&&<Stack direction="row" gap={1} sx={{mt:2}}><Button variant="contained" onClick={()=>act(b.id,"ACCEPTED")}>Accept</Button><Button color="error" variant="outlined" onClick={()=>act(b.id,"REJECTED")}>Reject</Button></Stack>}</Paper>)}{!items.length&&<Typography color="text.secondary">No booking requests.</Typography>}</Stack></DashboardShell></AuthGuard>}
