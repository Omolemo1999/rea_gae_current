"use client";
import { Alert, Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoadingButton from "@/components/loading/LoadingButton";

export default function FaceVerificationPage(){
  const {token}=useParams<{token:string}>(); const params=useSearchParams(); const router=useRouter();
  const videoRef=useRef<HTMLVideoElement>(null); const streamRef=useRef<MediaStream|null>(null);
  const [started,setStarted]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const mode=params.get("mode")==="ride"?"ride":"initial"; const rideId=params.get("rideId");
  useEffect(()=>()=>{streamRef.current?.getTracks().forEach(t=>t.stop())},[]);
  // The stream is attached only after React has mounted the video element.
  // Attaching it immediately after setStarted() was the cause of the dark preview.
  useEffect(()=>{
    if(!started||!streamRef.current||!videoRef.current)return;
    const video=videoRef.current; video.srcObject=streamRef.current; video.muted=true; video.playsInline=true; video.setAttribute("autoplay","true");
    void video.play().catch(()=>setError("The camera opened but the preview could not start. Please try again."));
  },[started]);
  const start=async()=>{try{setError(""); if(!window.isSecureContext)throw new Error("Camera access requires HTTPS. On localhost, use http://localhost."); if(!navigator.mediaDevices?.getUserMedia)throw new Error("This browser does not support camera access."); streamRef.current?.getTracks().forEach(t=>t.stop()); const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"user"},width:{ideal:1280},height:{ideal:960}},audio:false}); streamRef.current=s; setStarted(true);}catch(e){setError(e instanceof Error?e.message:"Camera access is required.")}};
  const capture=async()=>{const video=videoRef.current;if(!video)return;setBusy(true);setError("");try{if(video.readyState<HTMLMediaElement.HAVE_CURRENT_DATA||!video.videoWidth||!video.videoHeight)throw new Error("The camera is still starting. Please wait a moment and try again.");if(video.paused)await video.play();const c=document.createElement("canvas");c.width=video.videoWidth;c.height=video.videoHeight;const ctx=c.getContext("2d");if(!ctx)throw new Error("Could not prepare the camera image.");ctx.drawImage(video,0,0,c.width,c.height);const r=await fetch("/api/verification/face/complete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,selfie:c.toDataURL("image/jpeg",.92)})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Verification failed.");streamRef.current?.getTracks().forEach(t=>t.stop());router.replace(mode==="ride"&&rideId?`/rider/rides/${rideId}?face=complete`:"/rider/verification?face=complete")}catch(e){setError(e instanceof Error?e.message:"We could not submit the capture.")}finally{setBusy(false)}};
  return <AuthShell eyebrow="SECURE CAMERA CHECK"><Box sx={{maxWidth:650,mx:"auto"}}><Stack direction="row" gap={1.5} alignItems="center"><Box sx={{width:46,height:46,display:"grid",placeItems:"center",bgcolor:"#EEF2FF",color:"primary.main"}}><VerifiedUserRoundedIcon/></Box><Box><Typography variant="overline" color="primary" fontWeight={900}>{mode==="ride"?"RIDE REQUEST":"FIRST-TIME VERIFICATION"}</Typography><Typography variant="h4">Confirm it’s you</Typography></Box></Stack><LinearProgress variant="determinate" value={started?80:45} sx={{mt:3,height:4}}/><Typography color="text.secondary" sx={{mt:1}}>Your live face will be compared with the face captured from your ID.</Typography><Box sx={{mt:3,aspectRatio:"4/3",background:"#0B111A",display:"grid",placeItems:"center",overflow:"hidden",position:"relative"}}>{started?<video ref={videoRef} muted autoPlay playsInline style={{width:"100%",height:"100%",objectFit:"cover",transform:"scaleX(-1)",background:"#0B111A"}}/>:<Stack alignItems="center" gap={1.2} sx={{color:"rgba(255,255,255,.7)"}}><CameraAltRoundedIcon sx={{fontSize:56}}/><Typography>Camera preview</Typography></Stack>}{started&&<Box sx={{position:"absolute",inset:"11% 25%",border:"2px solid rgba(255,255,255,.86)",pointerEvents:"none"}}/>}</Box>{error&&<Alert severity="error" sx={{mt:2}}>{error}</Alert>}<LoadingButton fullWidth variant="contained" size="large" loading={busy} onClick={started?capture:start} startIcon={<CameraAltRoundedIcon/>} sx={{mt:2,minHeight:52}}>{started?"Capture and verify":"Enable camera"}</LoadingButton><Button fullWidth variant="text" onClick={()=>router.back()} disabled={busy} sx={{mt:1}}>Return</Button></Box></AuthShell>;
}
