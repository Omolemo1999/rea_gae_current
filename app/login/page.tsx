"use client";
import { Alert, Box, Button, Link as MuiLink, TextField, Typography, Paper } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";

export default function LoginPage() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");const [verifyEmail,setVerifyEmail]=useState("");const [resent,setResent]=useState(""); const [busy,setBusy]=useState(false);
  const router=useRouter();
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError("");
    const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
    const d=await r.json(); setBusy(false); if(!r.ok){setError(d.error||"Login failed.");if(d.code==="EMAIL_NOT_VERIFIED") setVerifyEmail(d.email||email);return;} router.replace("/dashboard");
  };
  return <Box sx={{minHeight:"100vh",display:"grid",placeItems:"center",p:2,background:"linear-gradient(135deg,#eef3ff,#fff)"}}>
    <AuthCard title="Welcome back" subtitle="Sign in to your ReaGae account. Staff use their assigned username or email.">
      {error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}{verifyEmail&&<Paper sx={{mb:2,p:2,borderRadius:3}} elevation={0}><Typography variant="body2">Need another verification email?</Typography><Button size="small" sx={{mt:1}} onClick={async()=>{const r=await fetch("/api/auth/resend-verification",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:verifyEmail})});const d=await r.json();setResent(d.message)}}>Resend verification email</Button>{resent&&<Typography variant="caption" display="block" sx={{mt:1}}>{resent}</Typography>}</Paper>}
      <Box component="form" onSubmit={submit}>
        <TextField label="Email or username" type="text" value={email} onChange={e=>setEmail(e.target.value)} sx={{mb:2}} required />
        <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} sx={{mb:1}} required />
        <MuiLink component={Link} href="/forgot-password" sx={{display:"block",textAlign:"right",mb:2}}>Forgot password?</MuiLink>
        <Button fullWidth type="submit" variant="contained" size="large" disabled={busy}>{busy?"Signing in…":"Sign in"}</Button>
      </Box>
      <Typography sx={{mt:3,textAlign:"center",color:"text.secondary"}}>Don't have an account? <MuiLink component={Link} href="/register">Create one</MuiLink></Typography>
    </AuthCard>
  </Box>;
}
