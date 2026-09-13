"use client";
import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export default function Reveal({ children, delay=0 }: { children: React.ReactNode; delay?: number }) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{ if(!ref.current) return; const ctx=gsap.context(()=>{gsap.fromTo(ref.current,{y:28,opacity:0},{y:0,opacity:1,duration:.65,delay,ease:"power3.out",scrollTrigger:{trigger:ref.current,start:"top 88%",once:true}})},ref); return()=>ctx.revert();},[delay]);
 return <Box ref={ref}>{children}</Box>;
}
