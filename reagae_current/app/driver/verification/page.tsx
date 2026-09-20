"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
export default function DriverVerificationRedirect(){const router=useRouter();useEffect(()=>{router.replace('/driver/rides/create')},[router]);return <AuthGuard role="DRIVER"><div /></AuthGuard>}
