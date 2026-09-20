"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CarLoader from "@/components/loading/CarLoader";
export default function DashboardPage(){
  const router=useRouter();
  useEffect(()=>{fetch("/api/auth/me").then(r=>r.ok?r.json():null).then(d=>{if(!d?.user){router.replace("/login");return;}router.replace(d.user.role==="DRIVER"?"/driver/dashboard":d.user.role==="RIDER"?"/rider/dashboard":d.user.role==="AGENT"?"/agent/dashboard":d.user.role==="ADMIN"?"/backoffice":"/login");});},[router]);
  return <CarLoader fullScreen label="Taking you to your workspace…"/>;
}
