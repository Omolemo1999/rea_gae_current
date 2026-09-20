"use client";

import { Box, Container, Divider, IconButton, Link, Stack, Typography } from "@mui/material";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => gsap.fromTo(footerRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .8, ease: "power3.out" }), footerRef);
    return () => ctx.revert();
  }, []);

  return <Box ref={footerRef} component="footer" sx={{ mt: "auto", overflow: "hidden", bgcolor: "#0D1A2E", color: "white", borderTop: "1px solid rgba(255,255,255,.08)" }}>
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 5 }, px: { xs: 2.5, md: 5 } }}>
      <Stack direction={{ xs: "column", md: "row" }} gap={4} justifyContent="space-between">
        <Box sx={{ maxWidth: 360 }}>
          <Typography variant="h5" fontWeight={900}>Rea<span style={{ color: "#6C8BEE" }}>Gae</span></Typography>
          <Typography sx={{ mt: 1, color: "rgba(255,255,255,.65)", lineHeight: 1.7 }}>Travel together with identity-led safety, secure payments and ride-specific protection.</Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} gap={{ xs: 2, sm: 4 }} sx={{ flex: 1, maxWidth: 850 }}>
          <Trust icon={<ShieldRoundedIcon />} title="Safety" text="Drivers and riders follow identity and safety checks. Ride reports and support are linked to journeys." />
          <Trust icon={<LockRoundedIcon />} title="Privacy" text="Personal information is not sold. Access is restricted and information is shared only for described service, legal or serious safety purposes." />
          <Trust icon={<VerifiedUserRoundedIcon />} title="Verification" text="Identity evidence is handled for verification. Riders complete a fresh face check each time they request a ride." />
        </Stack>
      </Stack>
      <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,.1)" }} />
      <Stack direction={{ xs: "column", sm: "row" }} gap={2} justifyContent="space-between" alignItems={{ sm: "center" }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,.42)" }}>© {new Date().getFullYear()} ReaGae. Safety and privacy information is part of our trust commitment.</Typography>
        <Stack direction="row" gap={2} flexWrap="wrap">
          <Link href="/privacy" underline="hover" sx={{ color: "rgba(255,255,255,.7)" }}>Privacy</Link>
          <Link href="/terms" underline="hover" sx={{ color: "rgba(255,255,255,.7)" }}>Terms</Link>
          <Link href="/login" underline="hover" sx={{ color: "rgba(255,255,255,.7)" }}>Support</Link>
          <IconButton onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" size="small" sx={{ color: "white", bgcolor: "rgba(255,255,255,.08)" }}><ArrowUpwardRoundedIcon fontSize="small" /></IconButton>
        </Stack>
      </Stack>
    </Container>
  </Box>;
}

function Trust({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <Stack direction="row" gap={1.5} sx={{ minWidth: 0, flex: 1 }}>
    <Box sx={{ width: 40, height: 40, flex: "0 0 auto", borderRadius: 0, display: "grid", placeItems: "center", bgcolor: "rgba(108,139,238,.12)", color: "#9EB2FF" }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}><Typography fontWeight={850}>{title}</Typography><Typography variant="caption" sx={{ color: "rgba(255,255,255,.58)", lineHeight: 1.6 }}>{text}</Typography></Box>
  </Stack>;
}
