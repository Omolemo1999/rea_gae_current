"use client";
import { Alert, Box, Button, Container, MenuItem, TextField, Typography } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";

export default function RegisterPage(){
  const params=useSearchParams(); const router=useRouter();
  const [role,setRole]=useState<"RIDER"|"DRIVER">((params.get("role") as "RIDER"|"DRIVER")||"RIDER");
  const [form,setForm]=useState({firstName:"",lastName:"",email:"",phone:"",password:"",confirm:""});
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  const set=(k:keyof typeof form)=>(e:React.ChangeEvent<HTMLInputElement>)=>setForm({...form,[k]:e.target.value});
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError("");if(form.password!==form.confirm){setError("Passwords do not match.");return;}setBusy(true);
    const r=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,role})});
    const d=await r.json();setBusy(false);if(!r.ok){setError(d.error||"Registration failed.");return;}router.replace("/verify");
  };
  return <Box sx={{minHeight:"100vh",py:8,display:"grid",placeItems:"center",background:"#F6F8FC"}}><AuthCard title="Create your account" subtitle="Choose how you will use ReaGae.">
    {error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}
    <Box component="form" onSubmit={submit}>
      <TextField select label="Account type" value={role} onChange={e=>setRole(e.target.value as "RIDER"|"DRIVER")} sx={{mb:2}}><MenuItem value="RIDER">Rider</MenuItem><MenuItem value="DRIVER">Driver</MenuItem></TextField>
      <TextField label="First name" value={form.firstName} onChange={set("firstName")} sx={{mb:2}} required />
      <TextField label="Last name" value={form.lastName} onChange={set("lastName")} sx={{mb:2}} required />
      <TextField label="Email" type="email" value={form.email} onChange={set("email")} sx={{mb:2}} required />
      <TextField label="Phone" value={form.phone} onChange={set("phone")} sx={{mb:2}} required />
      <TextField label="Password" type="password" value={form.password} onChange={set("password")} sx={{mb:2}} required helperText="10+ chars with upper, lower and number." />
      <TextField label="Confirm password" type="password" value={form.confirm} onChange={set("confirm")} sx={{mb:2}} required />
      <Button fullWidth variant="contained" size="large" type="submit" disabled={busy}>{busy?"Creating…":"Create account"}</Button>
    </Box>
    <Typography sx={{mt:3,textAlign:"center",color:"text.secondary"}}>Already registered? <Link href="/login">Sign in</Link></Typography>
  </AuthCard></Box>;
}
