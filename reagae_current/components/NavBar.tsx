"use client";

import {
  AppBar, Box, Button, Container, Drawer, IconButton, Stack, Toolbar, Typography
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Home", id: "home" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Find a Ride", id: "rides" },
  { label: "Drive With Us", id: "drivers" },
  { label: "About", id: "about" }
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (!element) {
      if (id === "rides") router.push("/rider/rides");
      if (id === "drivers") router.push("/register?role=DRIVER");
      return;
    }
    const navbarHeight = 78;
    const offsetPosition = element.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{
        zIndex: 1300,
        backgroundColor: scrolled ? "rgba(7,15,30,.84)" : "rgba(255,255,255,.04)",
        backdropFilter: scrolled ? "blur(22px) saturate(150%)" : "blur(8px)",
        WebkitBackdropFilter: scrolled ? "blur(22px) saturate(150%)" : "blur(8px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,.1)" : "1px solid rgba(18,33,59,.06)",
        boxShadow: scrolled ? "0 10px 40px rgba(0,0,0,.2)" : "none",
        transition: "background-color .22s ease,border-color .22s ease,box-shadow .22s ease"
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 5, lg: 7 } }}>
          <Toolbar disableGutters sx={{ minHeight: { xs: 68, md: 78 }, justifyContent: "space-between" }}>
            <Box onClick={() => scrollToSection("home")} sx={{ cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
              <Box component="img" src="/ReaGae_Logo.png" alt="ReaGae" sx={{ display: "block", width: { xs: 90, sm: 105, md: 120 }, height: "auto", objectFit: "contain" }} />
            </Box>

            <Stack direction="row" sx={{
              display: { xs: "none", md: "flex" }, alignItems: "center",
              gap: { md: .3, lg: .5 }, ml: { md: 4, lg: 7 }, mr: "auto"
            }}>
              {navItems.map(item => (
                <Button key={item.id} onClick={() => scrollToSection(item.id)} sx={{
                  position: "relative", px: { md: 1.25, lg: 1.5 }, py: 1, minWidth: "auto", borderRadius: "10px",
                  color: scrolled ? "rgba(255,255,255,.88)" : "#12213B",
                  fontSize: { md: ".78rem", lg: ".84rem" }, fontWeight: 750, textTransform: "none",
                  whiteSpace: "nowrap", transition: "color .2s ease,background-color .2s ease",
                  "&::after": { content: '""', position: "absolute", left: "50%", bottom: 5, width: 0, height: 2,
                    borderRadius: 10, backgroundColor: scrolled ? "#fff" : "#12213B",
                    transform: "translateX(-50%)", transition: "width .25s ease" },
                  "&:hover": { color: scrolled ? "#fff" : "#091426", backgroundColor: scrolled ? "rgba(255,255,255,.07)" : "rgba(18,33,59,.06)" },
                  "&:hover::after": { width: "18px" }
                }}>{item.label}</Button>
              ))}
            </Stack>

            <Button onClick={() => router.push("/rider/rides")} endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />}
              sx={{ display: { xs: "none", md: "inline-flex" }, flexShrink: 0, px: { md: 1.8, lg: 2.2 }, py: 1.1,
                borderRadius: "12px", color: "#fff", background: "linear-gradient(135deg,#315CD6,#19347F)",
                fontSize: { md: ".76rem", lg: ".82rem" }, fontWeight: 850, textTransform: "none",
                boxShadow: "0 8px 24px rgba(41,82,204,.25)", "&:hover": { background: "linear-gradient(135deg,#3D6BE8,#19347F)", transform: "translateY(-2px)" }
              }}>Get Started</Button>

            <IconButton onClick={() => setMobileOpen(true)} aria-label="Open navigation menu" sx={{
              display: { xs: "flex", md: "none" }, width: 42, height: 42, ml: 1,
              color: scrolled ? "#fff" : "#12213B",
              backgroundColor: scrolled ? "rgba(255,255,255,.1)" : "rgba(18,33,59,.06)",
              border: scrolled ? "1px solid rgba(255,255,255,.12)" : "1px solid rgba(18,33,59,.08)"
            }}><MenuRoundedIcon /></IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)} slotProps={{
        root: { sx: { zIndex: 1400 } },
        paper: { sx: {
          width: { xs: "84%", sm: 370 }, background: "linear-gradient(160deg,#fff 0%,#f4f7fc 100%)",
          color: "#12213B", borderLeft: "1px solid rgba(18,33,59,.08)", boxShadow: "-20px 0 60px rgba(18,33,59,.12)"
        }}
      }}>
        <Stack sx={{ height: "100%", p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Box component="img" src="/ReaGae_Logo.png" alt="ReaGae" sx={{ width: 105, height: "auto", objectFit: "contain" }} />
            <IconButton onClick={() => setMobileOpen(false)} aria-label="Close navigation menu"
              sx={{ width: 42, height: 42, color: "#12213B", background: "rgba(18,33,59,.06)", border: "1px solid rgba(18,33,59,.08)" }}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Box sx={{ width: "100%", height: "1px", backgroundColor: "rgba(18,33,59,.1)", mb: 3 }} />

          <Stack sx={{ width: "100%", gap: .5 }}>
            {navItems.map(item => (
              <Button key={item.id} fullWidth onClick={() => scrollToSection(item.id)} sx={{
                justifyContent: "flex-start", textAlign: "left", py: 1.7, px: 1.5, minHeight: 54,
                borderRadius: "12px", color: "rgba(18,33,59,.78)", fontWeight: 700, fontSize: ".98rem",
                textTransform: "none", "&:hover": { color: "#12213B", background: "rgba(18,33,59,.055)", transform: "translateX(4px)" }
              }}>{item.label}</Button>
            ))}
          </Stack>

          <Box sx={{ width: "100%", height: "1px", backgroundColor: "rgba(18,33,59,.1)", mt: 3, mb: 3 }} />

          <Box sx={{ flex: 1 }} />

          <Box sx={{ p: 2.2, mb: 2, borderRadius: "18px", background: "rgba(18,33,59,.045)", border: "1px solid rgba(18,33,59,.08)" }}>
            <Typography sx={{ color: "#12213B", fontWeight: 850, fontSize: ".95rem", mb: .6 }}>Ready to travel?</Typography>
            <Typography sx={{ color: "rgba(18,33,59,.5)", fontSize: ".72rem", lineHeight: 1.6 }}>Find someone heading your way.</Typography>
          </Box>

          <Button onClick={() => { setMobileOpen(false); router.push("/rider/rides"); }} endIcon={<ArrowForwardRoundedIcon />}
            sx={{ py: 1.6, borderRadius: "14px", color: "#fff", background: "linear-gradient(135deg,#315CD6,#19347F)", fontWeight: 850, textTransform: "none" }}>
            Find a Ride
          </Button>

          <Typography sx={{ mt: 2, textAlign: "center", color: "rgba(18,33,59,.35)", fontSize: ".62rem", letterSpacing: ".4px" }}>
            Long distance. Better together.
          </Typography>
        </Stack>
      </Drawer>
    </>
  );
}
