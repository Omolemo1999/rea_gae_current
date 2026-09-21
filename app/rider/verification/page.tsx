"use client";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import Face6RoundedIcon from "@mui/icons-material/Face6Rounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import FaceCaptureDialog from "@/components/verification/FaceCaptureDialog";
import IdentityDocumentCapture from "@/components/verification/IdentityDocumentCapture";
import { useEffect, useState } from "react";

const pretty=(v?:string)=>v?v.replaceAll("_"," ").toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()):"Not Started";

export default function RiderVerification(){
  const [p,setP]=useState<any>(); const [doc,setDoc]=useState<any>(); const [faceOpen,setFaceOpen]=useState(false); const [idOpen,setIdOpen]=useState(false); const [msg,setMsg]=useState("");
  const load=async()=>{const r=await fetch("/api/verification/rider",{cache:"no-store"}); const d=await r.json(); setP(d.profile); setDoc(d.document);};
  useEffect(()=>{void load()},[]);
  const idApproved=doc?.status==="APPROVED"; const faceVerified=p?.faceVerificationStatus==="VERIFIED"; const complete=p?.verificationStatus==="VERIFIED";
  return <AuthGuard role="RIDER"><DashboardShell role="RIDER"><Box sx={{maxWidth:1050,mx:"auto",pt:{xs:2,md:4}}}>
    <Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" alignItems={{sm:"center"}} gap={2}><Box><Typography variant="overline" color="primary" fontWeight={900}>IDENTITY & SAFETY</Typography><Typography variant="h3" sx={{mt:.4}}>Verify your rider profile</Typography><Typography color="text.secondary" sx={{mt:1,maxWidth:760}}>Capture the front of your physical ID with the camera, complete the live face check, then wait for the verification review. No PDF ID uploads are used.</Typography></Box><Chip icon={<SecurityRoundedIcon/>} label={complete?"Verified":pretty(p?.verificationStatus)} color={complete?"success":"warning"}/></Stack>
    {msg&&<Alert sx={{mt:2}} severity={msg.toLowerCase().includes("failed")||msg.toLowerCase().includes("could not")?"error":"info"}>{msg}</Alert>}
    <Box sx={{mt:4,position:"relative",overflow:"hidden",minHeight:210,background:"linear-gradient(115deg,#514ED0,#6D6AF7 58%,#8A86FF)",color:"#fff",p:{xs:3,md:5},display:"flex",alignItems:"flex-end"}}><Box sx={{position:"relative",maxWidth:650}}><Typography variant="h4" sx={{fontWeight:900}}>Your ID and your face must match.</Typography><Typography sx={{mt:1,color:"rgba(255,255,255,.78)",lineHeight:1.7}}>The ID is captured as an image from your physical card. During face verification, the live camera image and the face visible on that ID image are sent to CompreFace for comparison.</Typography></Box></Box>
    <Box sx={{mt:3,borderTop:"1px solid",borderColor:"divider"}}>
      <Step icon={idApproved?<CheckCircleRoundedIcon/>:<BadgeRoundedIcon/>} number="01" title="Capture government ID" status={idApproved?"Approved":pretty(doc?.status)} description={doc?"ID captured from camera: "+doc.fileName:"Use the camera to capture the front of your physical South African ID card."} action={!idApproved?<Button variant="contained" startIcon={<CameraAltRoundedIcon/>} onClick={()=>setIdOpen(true)}>{doc?"Retake ID":"Capture ID"}</Button>:null}/>
      <Step icon={faceVerified?<CheckCircleRoundedIcon/>:<Face6RoundedIcon/>} number="02" title="First-time face verification" status={faceVerified?"Verified":pretty(p?.faceVerificationStatus)} description={faceVerified?"Your live face matched the face on the captured ID image.":p?.faceVerificationStatus==="PENDING_REVIEW"?"Your capture is waiting for agent review.":"Complete a secure live camera capture. CompreFace compares it with the ID photo."} action={!faceVerified&&p?.faceVerificationStatus!=="PENDING_REVIEW"?<Button variant="contained" disabled={!doc||doc.status==="REJECTED"} onClick={()=>setFaceOpen(true)}>Start face check</Button>:null}/>
      <Step icon={<SecurityRoundedIcon/>} number="03" title="Verification review" status={complete?"Verified":pretty(p?.verificationStatus)} description={complete?"Your rider profile is ready.":"An agent reviews the first-time identity evidence after the biometric comparison."}/>
    </Box>
    <Alert severity="success" icon={<SecurityRoundedIcon/>} sx={{mt:3}}>Your information is protected. ReaGae uses the captured ID and face image only for the stated identity and safety purposes.</Alert>
    <IdentityDocumentCapture open={idOpen} onClose={()=>setIdOpen(false)} onCaptured={async(d)=>{setIdOpen(false);setMsg(d.message||"ID captured successfully.");await load()}}/>
    <FaceCaptureDialog open={faceOpen} mode="INITIAL" onClose={()=>setFaceOpen(false)} onComplete={async(d)=>{setFaceOpen(false);setMsg(d.message||"Face capture received.");await load()}}/>
  </Box></DashboardShell></AuthGuard>
}

function Step({icon,number,title,status,description,action}:{icon:React.ReactNode;number:string;title:string;status:string;description:string;action?:React.ReactNode}){return <Box sx={{py:3,borderBottom:"1px solid",borderColor:"divider"}}><Stack direction={{xs:"column",sm:"row"}} gap={2} alignItems={{sm:"center"}}><Box sx={{width:48,height:48,flex:"0 0 auto",display:"grid",placeItems:"center",bgcolor:"#F0F3FF",color:"primary.main"}}>{icon}</Box><Typography variant="caption" sx={{fontWeight:900,color:"#8A929D",letterSpacing:".08em"}}>{number}</Typography><Box sx={{flex:1,minWidth:0}}><Typography variant="h6">{title}</Typography><Typography variant="body2" color="text.secondary" sx={{mt:.3,overflowWrap:"anywhere"}}>{description}</Typography></Box><Chip label={status} color={status==="Verified"||status==="Approved"?"success":"default"} size="small"/>{action}</Stack></Box>}
