"use client";
import { Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect,useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import RideCard from "@/components/rides/RideCard";
import type { Ride } from "@/types/ride";

export default function DriverRides(){const [rides,setRides]=useState<Ride[]>([]);useEffect(()=>{fetch("/api/rides").then(r=>r.json()).then(d=>setRides(d.rides||[]));},[]);
return <AuthGuard role="DRIVER"><DashboardShell role="DRIVER"><Stack direction="row" justifyContent="space-between" alignItems="center"><div><Typography variant="h3">My Rides</Typography><Typography sx={{color:"text.secondary"}}>Journeys you have published.</Typography></div><Button component={Link} href="/driver/rides/create" variant="contained">Post ride</Button></Stack><Stack gap={2} sx={{mt:3}}>{rides.map(r=><RideCard key={r.id} ride={r} viewer="DRIVER"/>)}{rides.length===0&&<Typography color="text.secondary">No rides yet.</Typography>}</Stack></DashboardShell></AuthGuard>}
