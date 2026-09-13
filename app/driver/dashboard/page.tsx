"use client";
import { Alert, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import type { Ride } from "@/types/ride";import ExperienceBanner from "@/components/experience/ExperienceBanner";

export default function DriverDashboard(){
 const [rides,setRides]=useState<Ride[]>([]);const [profile,setProfile]=useState<any>(null);
 useEffect(()=>{Promise.all([fetch("/api/rides").then(r=>r.json()),fetch("/api/drivers/me").then(r=>r.json())]).then(([a,b])=>{setRides(a.rides||[]);setProfile(b.profile);});},[]);
 return <AuthGuard role="DRIVER"><DashboardShell role="DRIVER"><Typography variant="h3">Driver Dashboard</Typography><Typography sx={{mt:1,color:"text.secondary"}}>Manage journeys, bookings and your safety verification.</Typography>
 <Alert severity={profile?.verificationStatus==="VERIFIED"?"success":"warning"} sx={{mt:3}}>{profile?.verificationStatus==="VERIFIED"?"Driver verification is complete.":"Complete driver verification before publishing a ride."}</Alert><ExperienceBanner audience="DRIVER" slot="DRIVER_DASHBOARD_HERO"/>
 <Grid container spacing={2} sx={{mt:1}}>{[["Published rides",rides.filter(r=>r.driverId===profile?.userId).length],["Upcoming",rides.filter(r=>r.driverId===profile?.userId&&r.status==="PUBLISHED").length],["Verification",profile?.verificationStatus||"—"]].map(([a,b])=><Grid key={String(a)} size={{xs:12,md:4}}><Paper elevation={0} sx={{p:3,border:"1px solid #E5EAF2"}}><Typography color="text.secondary">{a}</Typography><Typography variant="h4" sx={{mt:1}}>{b}</Typography></Paper></Grid>)}</Grid>
 <Paper elevation={0} sx={{mt:3,p:3,border:"1px solid #E5EAF2"}}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h5">Your rides</Typography><Button component={Link} href="/driver/rides/create" variant="contained">Post a ride</Button></Stack><Typography sx={{mt:2,color:"text.secondary"}}>{rides.filter(r=>r.driverId===profile?.userId).length?"Your published rides are available under My Rides.":"No rides have been posted yet."}</Typography></Paper>
 </DashboardShell></AuthGuard>;
}
