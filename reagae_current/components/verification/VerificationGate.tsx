"use client";
import { useEffect, useState } from "react";
import { Backdrop, Box, Button, Dialog, DialogContent, Divider, Stack, Typography } from "@mui/material";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import Face6RoundedIcon from "@mui/icons-material/Face6Rounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { usePathname, useRouter } from "next/navigation";
import CarLoader from "@/components/loading/CarLoader";

export default function VerificationGate() {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const exempt = pathname.startsWith("/rider/verification") || pathname.startsWith("/verify/") || pathname === "/verify";

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch("/api/verification/rider", { cache: "no-store" })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => alive && setStatus(d?.profile?.verificationStatus ?? null))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [pathname]);

  if (exempt || status === "VERIFIED" || status === null) return null;

  return <Dialog
    open
    fullWidth
    maxWidth="md"
    disableEscapeKeyDown
    onClose={() => {}}
    aria-labelledby="verification-required-title"
    BackdropComponent={Backdrop}
    BackdropProps={{ sx: { backdropFilter: "blur(8px)", bgcolor: "rgba(8,14,26,.72)" } }}
    slotProps={{ paper: { sx: { m: { xs: 0, sm: 2 }, width: { xs: "100%", sm: "calc(100% - 32px)" } } } }}
  >
    <DialogContent sx={{ p: 0, overflow: "hidden" }}>
      {loading ? <Box sx={{ p: { xs: 3, sm: 6 } }}><CarLoader label="Checking your identity status…" /></Box> : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: ".8fr 1.2fr" }, minHeight: { md: 500 } }}>
          <Box sx={{ p: { xs: 3, sm: 5 }, color: "#fff", background: "linear-gradient(145deg,#6D6AF7,#514ED0 62%,#3E3BA8)", position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "absolute", width: 300, height: 120, right: -130, top: 65, border: "42px solid rgba(255,255,255,.08)", transform: "rotate(-15deg) skewX(-12deg)" }} />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Stack direction="row" gap={1.2} alignItems="center">
                <Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)" }}><VerifiedUserRoundedIcon /></Box>
                <Typography fontWeight={950} fontSize="1.25rem">ReaGae</Typography>
              </Stack>
              <Typography variant="overline" sx={{ display: "block", mt: 6, opacity: .75, fontWeight: 900, letterSpacing: ".12em" }}>IDENTITY REQUIRED</Typography>
              <Typography id="verification-required-title" sx={{ mt: 1, fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-.05em" }}>Verify before you continue.</Typography>
              <Typography sx={{ mt: 2, color: "rgba(255,255,255,.78)", lineHeight: 1.7 }}>Your rider profile must be verified before you can request or manage rides. This prompt stays in place until the first-time verification journey is complete.</Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 3, sm: 5 }, minWidth: 0 }}>
            <Typography variant="overline" color="primary" fontWeight={900}>SECURE ONBOARDING</Typography>
            <Typography variant="h4" sx={{ mt: .5 }}>Two things to complete</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>The first-time check establishes your verified identity. After that, every ride request gets a fresh face check tied to that journey.</Typography>
            <Divider sx={{ my: 3 }} />
            <Stack gap={0}>
              <GateRow icon={<BadgeRoundedIcon />} number="01" title="Government ID" text="Upload your identity document. The uploaded filename stays visible in your verification record." />
              <GateRow icon={<Face6RoundedIcon />} number="02" title="Face verification" text="Allow camera access and complete a secure face capture using your own face." />
            </Stack>
            <Button fullWidth variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 3, minHeight: 52 }} onClick={() => router.push("/rider/verification")}>Start verification</Button>
            <Stack direction="row" gap={1} alignItems="flex-start" sx={{ mt: 2 }}><LockRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} /><Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>Your information is protected and handled according to the ReaGae Privacy Policy.</Typography></Stack>
          </Box>
        </Box>
      )}
    </DialogContent>
  </Dialog>;
}

function GateRow({ icon, number, title, text }: { icon: React.ReactNode; number: string; title: string; text: string }) {
  return <Stack direction="row" gap={1.5} sx={{ py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
    <Box sx={{ width: 42, height: 42, flex: "0 0 auto", display: "grid", placeItems: "center", bgcolor: "#F0F2FF", color: "#514ED0" }}>{icon}</Box>
    <Typography variant="caption" sx={{ fontWeight: 900, color: "#8A929D", letterSpacing: ".08em", pt: .4 }}>{number}</Typography>
    <Box sx={{ minWidth: 0 }}><Typography fontWeight={850}>{title}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .25, lineHeight: 1.55 }}>{text}</Typography></Box>
  </Stack>;
}
