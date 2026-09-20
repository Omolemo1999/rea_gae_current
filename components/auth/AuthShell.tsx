"use client";

import { Box, Container, Stack, Typography } from "@mui/material";
import DirectionsCarFilledRoundedIcon from "@mui/icons-material/DirectionsCarFilledRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function AuthShell({ children, eyebrow = "SAFE TRAVEL, DESIGNED AROUND YOU" }: { children: React.ReactNode; eyebrow?: string }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F6F8", p: { xs: 0, md: 2.5 }, display: "flex", alignItems: "stretch" }}>
      <Box sx={{ width: "100%", minHeight: { xs: "100vh", md: "calc(100vh - 40px)" }, bgcolor: "#fff", display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(430px,.9fr) minmax(480px,1.1fr)" }, overflow: "hidden", border: { xs: 0, md: "1px solid #E6E8EC" }, boxShadow: { xs: "none", md: "0 24px 80px rgba(16,24,40,.10)" } }}>
        <Box sx={{ position: "relative", overflow: "hidden", minHeight: { xs: 330, md: "auto" }, bgcolor: "#514ED0", color: "#fff", p: { xs: 3, sm: 5, lg: 7 }, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(145deg,#6D6AF7 0%,#514ED0 62%,#3E3BA8 100%)" }} />
          <Box sx={{ position: "absolute", width: 460, height: 180, right: -180, top: 70, border: "55px solid rgba(255,255,255,.07)", transform: "rotate(-16deg) skewX(-12deg)" }} />
          <Box sx={{ position: "absolute", width: 330, height: 120, left: -160, bottom: 80, bgcolor: "rgba(255,255,255,.07)", transform: "skewX(-24deg)" }} />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box component="a" href="/" sx={{ display: "inline-flex", alignItems: "center", gap: 1.2, color: "#fff", textDecoration: "none" }}>
              <Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.24)" }}><DirectionsCarFilledRoundedIcon /></Box>
              <Typography sx={{ fontWeight: 950, fontSize: "1.45rem", letterSpacing: "-.04em" }}>ReaGae</Typography>
            </Box>
            <Typography variant="overline" sx={{ display: "block", mt: { xs: 5, md: 10 }, letterSpacing: ".13em", fontWeight: 850, opacity: .75 }}>{eyebrow}</Typography>
            <Typography sx={{ mt: 1.2, fontSize: { xs: "2rem", md: "3.1rem" }, lineHeight: 1.03, fontWeight: 900, letterSpacing: "-.055em", maxWidth: 560 }}>Move with confidence. Arrive with peace of mind.</Typography>
            <Typography sx={{ mt: 2, maxWidth: 500, color: "rgba(255,255,255,.78)", fontSize: "1rem", lineHeight: 1.7 }}>Identity-led safety, verified journeys and clear privacy controls — built into the trip from the moment you sign in.</Typography>
          </Box>
          <Box component="img" src="/ReaGae_Banner.png" alt="ReaGae journey" sx={{ position: "absolute", right: { xs: -70, md: -25 }, bottom: { xs: 75, md: 105 }, width: { xs: 250, md: 390 }, height: { xs: 105, md: 165 }, objectFit: "cover", opacity: .18, filter: "saturate(.7) contrast(1.05)", transform: "rotate(-3deg)", zIndex: 0 }} />
          <Stack direction="row" flexWrap="wrap" gap={1.2} sx={{ position: "relative", zIndex: 1, mt: 5 }}>
            {[{ icon: <VerifiedUserRoundedIcon />, text: "Verified identities" }, { icon: <LockRoundedIcon />, text: "Protected information" }].map((x) => <Stack key={x.text} direction="row" alignItems="center" gap={1} sx={{ px: 1.5, py: 1, bgcolor: "rgba(255,255,255,.11)", border: "1px solid rgba(255,255,255,.16)" }}><Box sx={{ display: "grid", placeItems: "center" }}>{x.icon}</Box><Typography variant="body2" fontWeight={800}>{x.text}</Typography></Stack>)}
            <ArrowForwardRoundedIcon sx={{ alignSelf: "center", opacity: .55, display: { xs: "none", sm: "block" } }} />
          </Stack>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, sm: 5, lg: 8 }, minWidth: 0, overflow: "auto" }}>
          <Container maxWidth="sm" disableGutters>{children}</Container>
        </Box>
      </Box>
    </Box>
  );
}
