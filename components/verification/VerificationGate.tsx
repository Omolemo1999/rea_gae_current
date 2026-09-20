"use client";
import { useEffect, useState } from "react";
import { Backdrop, Box, Button, CircularProgress, Dialog, DialogContent, Divider, Stack, Typography } from "@mui/material";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { usePathname, useRouter } from "next/navigation";
import CarLoader from "@/components/loading/CarLoader";

export default function VerificationGate() {
  const pathname = usePathname(); const router = useRouter();
  const [status, setStatus] = useState<string | null>(null); const [loading, setLoading] = useState(true);
  const exempt = pathname.startsWith("/rider/verification") || pathname.startsWith("/verify/") || pathname === "/verify";
  useEffect(() => { let alive = true; setLoading(true); fetch("/api/verification/rider", { cache: "no-store" }).then(async r => r.ok ? r.json() : null).then(d => { if (alive) setStatus(d?.profile?.verificationStatus ?? null); }).catch(() => {}).finally(() => alive && setLoading(false)); return () => { alive = false; }; }, [pathname]);
  if (exempt || status === "VERIFIED" || status === null) return null;
  return <Dialog open fullScreen={false} maxWidth="sm" fullWidth disableEscapeKeyDown onClose={() => {}} aria-labelledby="verification-required-title" BackdropComponent={Backdrop} BackdropProps={{ sx: { backdropFilter: "blur(8px)", bgcolor: "rgba(8,14,26,.72)" } }}>
    <DialogContent sx={{ p: { xs: 3, sm: 5 }, overflow: "hidden" }}>
      {loading ? <CarLoader label="Checking your identity status…" /> : <>
        <Stack direction="row" alignItems="center" gap={1.5}><Box sx={{ width: 48, height: 48, display: "grid", placeItems: "center", bgcolor: "#EEF2FF", color: "primary.main" }}><VerifiedUserRoundedIcon /></Box><Box sx={{ minWidth: 0 }}><Typography variant="overline" color="primary" fontWeight={900}>Identity required</Typography><Typography id="verification-required-title" variant="h4" sx={{ mt: .2 }}>Verify before you continue</Typography></Box></Stack>
        <Typography sx={{ mt: 2, color: "text.secondary", lineHeight: 1.7 }}>To request or manage rides, your ReaGae account needs its first-time ID and face verification. This secure prompt stays in place until the process is complete.</Typography>
        <Divider sx={{ my: 3 }} />
        <Stack gap={1.5}>{[{icon:<VerifiedUserRoundedIcon/>,title:"Government ID",text:"Upload your identity document and see its filename and review status."},{icon:<LockRoundedIcon/>,title:"Face verification",text:"Complete a secure camera check so your account is linked to you."}].map(x=><Stack key={x.title} direction="row" gap={1.5} sx={{ p: 1.5, bgcolor: "#F7F8FA", borderLeft: "3px solid #315CD6" }}><Box sx={{ color:"primary.main", display:"grid", placeItems:"center" }}>{x.icon}</Box><Box><Typography fontWeight={850}>{x.title}</Typography><Typography variant="body2" color="text.secondary">{x.text}</Typography></Box></Stack>)}</Stack>
        <Button fullWidth variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 3 }} onClick={() => router.push("/rider/verification")}>Start verification</Button>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, textAlign: "center" }}>Your information is protected and handled according to the ReaGae Privacy Policy.</Typography>
      </>}
    </DialogContent>
  </Dialog>;
}
