"use client";

import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import NotificationBell from "@/components/common/NotificationBell";
import VerificationGate from "@/components/verification/VerificationGate";

const roleLabels = {
  DRIVER: "Driver workspace",
  RIDER: "Rider workspace",
  AGENT: "Operations workspace",
  ADMIN: "Admin console",
} as const;

export default function DashboardShell({ role, children }: { role: "RIDER" | "DRIVER" | "AGENT" | "ADMIN"; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const prefix = role === "DRIVER" ? "/driver" : role === "RIDER" ? "/rider" : role === "AGENT" ? "/agent" : "/backoffice";

  const links = role === "DRIVER"
    ? [["Overview", "/driver/dashboard", DashboardRoundedIcon], ["My rides", "/driver/rides", DirectionsCarRoundedIcon], ["Bookings", "/driver/bookings", EventSeatRoundedIcon], ["Profile", "/driver/profile", PersonRoundedIcon]]
    : role === "RIDER"
      ? [["Overview", "/rider/dashboard", DashboardRoundedIcon], ["Find a ride", "/rider/rides", DirectionsCarRoundedIcon], ["Bookings", "/rider/bookings", EventSeatRoundedIcon], ["Trips", "/rider/trips", DirectionsCarRoundedIcon], ["Payments", "/rider/payments", CreditCardRoundedIcon], ["Profile", "/rider/profile", PersonRoundedIcon]]
      : role === "AGENT"
        ? [["Operations", "/agent/dashboard", DashboardRoundedIcon], ["Driver verification", "/agent/drivers", VerifiedRoundedIcon], ["Rider verification", "/agent/riders", VerifiedRoundedIcon], ["Safety reports", "/agent/reports", ShieldRoundedIcon], ["Support", "/agent/support", EventSeatRoundedIcon]]
        : [["Command center", "/backoffice", DashboardRoundedIcon], ["Drivers", "/agent/drivers", DirectionsCarRoundedIcon], ["Agents", "/backoffice/agents", PersonRoundedIcon], ["Safety", "/agent/reports", ShieldRoundedIcon], ["Payments", "/backoffice/payments", CreditCardRoundedIcon], ["Experience", "/backoffice/experience", DashboardRoundedIcon]];

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const nav = (
    <List sx={{ px: 0 }}>
      {links.map(([label, href, Icon]: any) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <ListItemButton
            component={Link}
            href={href}
            key={href}
            onClick={() => setOpen(false)}
            sx={{
              minHeight: 50,
              mb: 0,
              py: 1,
              px: 2,
              position: "relative",
              color: active ? "#111318" : "#626B78",
              bgcolor: active ? "#F0F2FF" : "transparent",
              borderLeft: active ? "3px solid #514ED0" : "3px solid transparent",
              "&:hover": { bgcolor: "#F5F6F8", color: "#111318" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: active ? "#514ED0" : "inherit" }}><Icon fontSize="small" /></ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontWeight: active ? 800 : 650, fontSize: ".9rem" }} />
          </ListItemButton>
        );
      })}
    </List>
  );

  const actionHref = role === "DRIVER" ? "/driver/rides/create" : role === "RIDER" ? "/rider/rides" : role === "AGENT" ? "/agent/drivers" : "/backoffice/agents";
  const actionLabel = role === "DRIVER" ? "Post a ride" : role === "RIDER" ? "Find a ride" : role === "AGENT" ? "Review verification" : "Manage agents";

  const brand = (
    <Box sx={{ p: 2.25, color: "#fff", background: "linear-gradient(145deg,#6D6AF7,#514ED0 60%,#3E3BA8)", position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", width: 170, height: 170, right: -85, top: -95, border: "45px solid rgba(255,255,255,.09)", transform: "rotate(18deg)" }} />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography component={Link} href={`${prefix}/dashboard`} sx={{ color: "inherit", textDecoration: "none", fontWeight: 950, fontSize: "1.35rem", letterSpacing: "-.045em" }}>
          ReaGae
        </Typography>
        <Typography variant="caption" sx={{ display: "block", mt: .5, color: "rgba(255,255,255,.74)", fontWeight: 700 }}>{roleLabels[role]}</Typography>
      </Box>
    </Box>
  );

  const sideContent = (
    <Box sx={{ width: { xs: 286, md: 244 }, height: "100%", bgcolor: "#fff" }}>
      {brand}
      <Box sx={{ px: 2.2, py: 2 }}><Typography variant="caption" sx={{ fontWeight: 850, color: "#8A929D", textTransform: "uppercase", letterSpacing: ".09em" }}>Workspace</Typography></Box>
      {nav}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ px: 2 }}>
        <StackSafety role={role} />
        <Button component={Link} href={actionHref} fullWidth variant="contained" startIcon={role === "DRIVER" ? <AddRoundedIcon /> : role === "RIDER" ? <DirectionsCarRoundedIcon /> : <VerifiedRoundedIcon />} sx={{ mt: 1.5 }}>
          {actionLabel}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", background: "#F5F6F8", color: "#111318", overflowX: "hidden" }}>
      <AppBar position="fixed" elevation={0} sx={{ background: "rgba(255,255,255,.96)", backdropFilter: "blur(18px)", color: "#111318", borderBottom: "1px solid #E3E6EB", zIndex: 1200 }}>
        <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64, md: 70 }, px: { xs: 1.5, md: 2.5 } }}>
          <IconButton sx={{ display: { md: "none" } }} onClick={() => setOpen(true)} aria-label="Open navigation"><MenuIcon /></IconButton>
          <Typography component={Link} href={`${prefix}/dashboard`} sx={{ textDecoration: "none", color: "inherit", fontWeight: 950, fontSize: "1.35rem", letterSpacing: "-.045em" }}>Rea<span style={{ color: "#514ED0" }}>Gae</span></Typography>
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", ml: 3, px: 1.5, py: .75, bgcolor: "#F5F6F8", color: "#7A8390", gap: 1, minWidth: 230 }}>
            <SearchRoundedIcon fontSize="small" /><Typography variant="body2">Search workspace</Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" }, fontWeight: 700, color: "#626B78" }}>{roleLabels[role]}</Typography>
          <NotificationBell />
          <IconButton onClick={logout} aria-label="Log out"><LogoutIcon fontSize="small" /></IconButton>
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={() => setOpen(false)} ModalProps={{ keepMounted: true }} PaperProps={{ sx: { borderRadius: 0 } }}>
        {sideContent}
      </Drawer>

      <Box sx={{ display: "flex", pt: { xs: 8, md: 8.75 } }}>
        <Box component="aside" sx={{ display: { xs: "none", md: "block" }, width: 244, position: "fixed", top: 70, bottom: 0, borderRight: "1px solid #E3E6EB", background: "#fff", overflowY: "auto" }}>
          {sideContent}
        </Box>
        <Box component="main" sx={{ flex: 1, minWidth: 0, width: { xs: "100%", md: "calc(100% - 244px)" }, ml: { md: "244px" }, px: { xs: 1.5, sm: 2.5, lg: 4 }, pb: 7, overflowX: "hidden" }}>
          {children}
        </Box>
      </Box>

      {role === "RIDER" && <VerificationGate />}
    </Box>
  );
}

function StackSafety({ role }: { role: "RIDER" | "DRIVER" | "AGENT" | "ADMIN" }) {
  return (
    <Box sx={{ display: "flex", gap: 1, p: 1.3, bgcolor: "#F7F8FB", borderLeft: "3px solid #514ED0" }}>
      <SecurityRoundedIcon sx={{ color: "#514ED0", fontSize: 19, mt: .1 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" fontWeight={850}>Safety first</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.45 }}>
          {role === "RIDER" ? "Identity checks protect every ride request." : "Verification and safety activity is recorded."}
        </Typography>
      </Box>
    </Box>
  );
}
