"use client";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PhoneFaceVerification() {
  const { token } = useParams<{token:string}>();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream,setStream] = useState<MediaStream|null>(null);
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [started,setStarted] = useState(false);
  useEffect(()=>()=>{stream?.getTracks().forEach(t=>t.stop())},[stream]);
  const start=async()=>{try{setError("");const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:720},height:{ideal:720}},audio:false});setStream(s);setStarted(true);if(videoRef.current){videoRef.current.srcObject=s;await videoRef.current.play()}}catch{setError("Camera access is required. Please allow camera access and try again on your phone.")}};
  const capture=async()=>{if(!videoRef.current)return;setBusy(true);const canvas=document.createElement("canvas");canvas.width=videoRef.current.videoWidth||720;canvas.height=videoRef.current.videoHeight||720;canvas.getContext("2d")?.drawImage(videoRef.current,0,0,canvas.width,canvas.height);const selfie=canvas.toDataURL("image/jpeg",.82);const r=await fetch("/api/verification/face/complete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,selfie})});const d=await r.json();setBusy(false);if(!r.ok){setError(d.error||"Capture failed.");return}stream?.getTracks().forEach(t=>t.stop());router.replace("/login?face=received")};
  return <Box sx={{minHeight:"100vh",display:"grid",placeItems:"center",p:2,background:"radial-gradient(circle at 20% 10%,rgba(91,108,255,.14),transparent 35%),#F5F7FC"}}><Paper elevation={0} sx={{width:"100%",maxWidth:520,p:{xs:2.5,sm:4},borderRadius:5,border:"1px solid",borderColor:"divider"}}><Typography variant="overline" color="primary" fontWeight={900}>ReaGae secure verification</Typography><Typography variant="h4" sx={{mt:1}}>Live face check</Typography><Typography color="text.secondary" sx={{mt:1.2}}>Keep your face inside the frame. This uses your phone camera rather than a desktop webcam.</Typography>{error&&<Alert severity="error" sx={{mt:2}}>{error}</Alert>}<Box sx={{mt:3,aspectRatio:"1/1",borderRadius:4,overflow:"hidden",background:"#101522",display:"grid",placeItems:"center"}}>{started?<video ref={videoRef} muted playsInline style={{width:"100%",height:"100%",objectFit:"cover",transform:"scaleX(-1)"}}/>:<CameraAltRoundedIcon sx={{fontSize:64,color:"rgba(255,255,255,.65)"}}/>}</Box><Stack gap={1.5} sx={{mt:3}}>{!started?<Button variant="contained" size="large" onClick={start}>Enable camera</Button>:<Button variant="contained" size="large" disabled={busy} onClick={capture}>{busy?"Submitting secure capture…":"Capture & submit"}</Button>}<Typography variant="caption" color="text.secondary" textAlign="center">ReaGae does not treat a browser-side image as an approval. Results are reviewed server-side.</Typography></Stack></Paper></Box>;
}
