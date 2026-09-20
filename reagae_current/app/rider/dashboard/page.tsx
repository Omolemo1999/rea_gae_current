"use client";
import { Alert, Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Reveal from "@/components/common/Reveal";
import ExperienceBanner from "@/components/experience/ExperienceBanner";
import CarLoader from "@/components/loading/CarLoader";
import { useEffect, useState } from "react";
import type { Booking } from "@/types/booking";

const pretty = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (x) => x.toUpperCase());

export default function RiderDashboard() {
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/bookings", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Could not load your bookings.");
        if (active) setItems(d.bookings || []);
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : "Could not load your bookings."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const active = items.filter((b) => ["REQUESTED", "ACCEPTED"].includes(b.status));
  const completed = items.filter((b) => b.status === "COMPLETED");

  return <AuthGuard role="RIDER"><DashboardShell role="RIDER">
    <Reveal>
      <Box sx={{ mt: { xs: 2, md: 4 }, p: { xs: 2.5, md: 4.5 }, color: "#fff", position: "relative", overflow: "hidden", background: "linear-gradient(120deg,#514ED0,#6D6AF7 62%,#8A86FF)" }}>
        <Box sx={{ position: "absolute", right: -70, bottom: -80, width: 260, height: 140, bgcolor: "rgba(255,255,255,.08)", transform: "skewX(-24deg)" }} />
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} gap={3} sx={{ position: "relative" }}>
          <Box sx={{ maxWidth: 680 }}>
            <Typography variant="overline" sx={{ opacity: .78, fontWeight: 900, letterSpacing: ".13em" }}>RIDER WORKSPACE</Typography>
            <Typography variant="h3" sx={{ mt: .6, fontSize: { xs: "2rem", md: "3rem" } }}>Move with confidence.</Typography>
            <Typography sx={{ mt: 1.2, color: "rgba(255,255,255,.8)", lineHeight: 1.7 }}>Find verified rides, manage your bookings and keep your identity protected throughout the journey.</Typography>
            <Button component={Link} href="/rider/rides" sx={{ mt: 2.5, bgcolor: "#fff", color: "#514ED0", "&:hover": { bgcolor: "#fff" } }} endIcon={<ArrowForwardRoundedIcon />}>Find a ride</Button>
          </Box>
          <Box sx={{ display: "grid", placeItems: "center", width: { xs: "100%", md: 170 }, height: 130, border: "1px solid rgba(255,255,255,.22)", bgcolor: "rgba(255,255,255,.08)" }}>
            <DirectionsCarRoundedIcon sx={{ fontSize: 72, opacity: .9 }} />
          </Box>
        </Stack>
      </Box>
    </Reveal>

    <ExperienceBanner audience="RIDER" slot="RIDER_DASHBOARD_HERO" />

    <Grid container spacing={0} sx={{ mt: 3, borderTop: "1px solid", borderColor: "divider", borderLeft: "1px solid", borderRight: "1px solid" }}>
      {[["Active bookings", active.length, "/rider/bookings", EventSeatRoundedIcon], ["Completed trips", completed.length, "/rider/trips", DirectionsCarRoundedIcon], ["Ratings given", completed.length, "/rider/ratings", SecurityRoundedIcon]].map(([label, value, href, Icon], i) => (
        <Grid size={{ xs: 12, sm: 4 }} key={String(label)}>
          <Reveal delay={i * .08}>
            <Box component={Link} href={String(href)} sx={{ display: "block", p: 2.5, textDecoration: "none", color: "inherit", borderBottom: "1px solid", borderRight: { sm: i < 2 ? "1px solid" : 0 }, borderColor: "divider", transition: "background .2s ease", "&:hover": { bgcolor: "#F7F8FB" } }}>
              <Icon sx={{ color: "#514ED0", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">{label}</Typography>
              <Typography variant="h4" sx={{ mt: .35 }}>{value}</Typography>
            </Box>
          </Reveal>
        </Grid>
      ))}
    </Grid>

    {error && <Alert sx={{ mt: 2 }} severity="error">{error}</Alert>}
    <Alert sx={{ mt: 3 }} severity="info" icon={<SecurityRoundedIcon />}>Every ride request requires a fresh face verification. That check is tied to the specific request and does not require agent approval.</Alert>

    <Paper elevation={0} sx={{ mt: 3, p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
        <Box><Typography variant="h5">Recent bookings</Typography><Typography color="text.secondary" sx={{ mt: .5 }}>Your latest journey requests</Typography></Box>
        <Button component={Link} href="/rider/bookings" endIcon={<ArrowForwardRoundedIcon />}>See all</Button>
      </Stack>
      {loading ? <CarLoader label="Loading your bookings…" /> : items.slice(0, 3).map((b) => <Box key={b.id} sx={{ mt: 2, p: 2, bgcolor: "#F7F8FB", borderLeft: "3px solid #DDE2F4" }}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}><Typography fontWeight={800} sx={{ overflowWrap: "anywhere" }}>{b.ride?.pickupName} → {b.ride?.destinationName}</Typography><Typography fontWeight={850} color="primary">{pretty(b.status)}</Typography></Stack><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>{b.seatsRequested} seat(s) · {b.bags} bag(s)</Typography></Box>)}
      {!loading && !items.length && <Typography color="text.secondary" sx={{ mt: 2 }}>No bookings yet. Your next ride is one search away.</Typography>}
    </Paper>
  </DashboardShell></AuthGuard>;
}
