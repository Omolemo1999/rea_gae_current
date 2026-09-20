"use client";

import { Alert, Avatar, Box, Button, Chip, CircularProgress, Fade, Paper, Stack, Typography, MenuItem, TextField } from "@mui/material";
import FaceRetouchingNaturalRoundedIcon from "@mui/icons-material/FaceRetouchingNaturalRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Mascot from "@/components/common/Mascot";
import FaceCaptureDialog from "@/components/verification/FaceCaptureDialog";
import LiveMap from "@/components/maps/LiveMap";
import { calculateFees } from "@/lib/pricing";

export default function RiderRideDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const params = useSearchParams();
  const [ride, setRide] = useState<any>(null);
  const [livePoint, setLivePoint] = useState<any>(null);
  const [error, setError] = useState("");
  const [seats, setSeats] = useState(1);
  const [bags, setBags] = useState(0);
  const [busy, setBusy] = useState(false);
  const [faceBusy, setFaceBusy] = useState(false);
  const [faceUrl, setFaceUrl] = useState("");
  const [faceOpen, setFaceOpen] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [collection, setCollection] = useState({ name: "", type: "MALL", latitude: "", longitude: "" });
  const [verification, setVerification] = useState<any>(null);

  const load = async () => {
    const [rideRes, profileRes] = await Promise.all([fetch(`/api/rides/${id}`), fetch("/api/verification/rider")]);
    const [rideData, profileData] = await Promise.all([rideRes.json(), profileRes.json()]);
    setRide(rideData.ride || null); setVerification(profileData.profile);
    if (params.get("face") === "complete") setFaceVerified(true);
  };

  useEffect(() => { load(); }, [id, params]);

  useEffect(() => {
    if (!ride) return;
    const poll = async () => {
      const r = await fetch(`/api/tracking/${id}`);
      if (r.ok) { const d = await r.json(); if (d.location) setLivePoint({ latitude: d.location.latitude, longitude: d.location.longitude }); }
    };
    poll(); const timer = window.setInterval(poll, 5000); return () => window.clearInterval(timer);
  }, [id, ride?.id]);

  const startRideFace = () => {
    setError("");
    setFaceOpen(true);
  };

  const book = async () => {
    if (!verification || verification.verificationStatus !== "VERIFIED") { router.push("/rider/verification"); return; }
    if (!faceVerified) { setError("Complete the live face check for this ride before continuing."); return; }
    setBusy(true); setError("");
    try {
      if (!collection.name.trim()) throw new Error("Choose a public collection point.");
      const r = await fetch("/api/payments/initialize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rideId: id, seatsRequested: seats, bags, collectionSpot: { ...collection, latitude: Number(collection.latitude), longitude: Number(collection.longitude) } }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Payment could not be started.");
      window.location.href = d.authorization_url;
    } catch (e) { setError(e instanceof Error ? e.message : "Payment could not be started."); setBusy(false); }
  };

  return <AuthGuard role="RIDER"><DashboardShell role="RIDER"><Fade in timeout={500}><Box>
    {ride ? <>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} alignItems={{ sm: "center" }}>
        <Box sx={{ minWidth: 0 }}><Typography variant="h3" sx={{ overflowWrap: "anywhere" }}>{ride.pickupName} → {ride.destinationName}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{ride.departureDate} · {ride.departureTime}</Typography></Box><Mascot compact />
      </Stack>
      <Stack direction="row" gap={1} sx={{ mt: 3, flexWrap: "wrap" }}><Chip label={`${ride.distanceKm} km`} /><Chip label={`${ride.availableSeats} seats available`} /><Chip label={`R${Number(ride.pricePerSeat).toFixed(0)} / seat`} color="primary" /></Stack>

      {verification?.verificationStatus !== "VERIFIED" && <Alert severity="warning" sx={{ mt: 2 }}>Complete your first-time identity verification before requesting a ride. <Button size="small" onClick={() => router.push("/rider/verification")}>Verify now</Button></Alert>}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,1.35fr) minmax(300px,.8fr)" }, gap: 3, mt: 3 }}>
        <Paper sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider", minWidth: 0 }} elevation={0}>
          <Typography variant="h6">Your journey</Typography>
          <Box sx={{ mt: 3, p: 2, borderRadius: 3, bgcolor: "rgba(49,92,214,.07)", overflow: "hidden" }}>
            <Typography fontWeight={800}>Pickup</Typography><Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{ride.pickupName}</Typography>
            <Typography sx={{ my: 2, color: "primary.main", fontWeight: 900 }}>↓</Typography>
            <Typography fontWeight={800}>Destination</Typography><Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{ride.destinationName}</Typography>
          </Box>
          <LiveMap point={livePoint || undefined} pickup={ride?.pickup} destination={ride?.destination} height={360} />
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mt: 3, minWidth: 0 }}><Avatar src={ride.driver?.profilePhotoUrl || undefined}>{ride.driver?.firstName?.[0]}</Avatar><Box sx={{ minWidth: 0 }}><Typography><b>{ride.driver?.firstName} {ride.driver?.lastName}</b></Typography><Typography variant="body2" color="text.secondary">Rating {Number(ride.driver?.ratingAverage || 0).toFixed(1)} / 5 · {ride.vehicle?.make} {ride.vehicle?.model}</Typography></Box></Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider", minWidth: 0 }} elevation={0}>
          <Typography variant="h6">Request seats & collection</Typography>
          <Stack gap={2} sx={{ mt: 2 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: faceVerified ? "rgba(21,154,112,.06)" : "rgba(49,92,214,.055)", border: "1px solid", borderColor: faceVerified ? "success.main" : "rgba(49,92,214,.15)" }}>
              <Stack direction="row" gap={1.5} alignItems="center">
                <FaceRetouchingNaturalRoundedIcon color={faceVerified ? "success" : "primary"} />
                <Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={850}>Identity check for this request</Typography><Typography variant="caption" color="text.secondary">{faceVerified ? "Confirmed for this ride. No agent approval is required." : "A fresh face check is required every time you request a ride."}</Typography></Box>
                {faceVerified ? <VerifiedUserRoundedIcon color="success" /> : <Button size="small" variant="contained" disabled={faceBusy || verification?.verificationStatus !== "VERIFIED"} onClick={startRideFace}>{faceBusy ? <CircularProgress size={18} color="inherit" /> : "Verify me"}</Button>}
              </Stack>

            </Paper>

            <TextField select label="Collection point type" value={collection.type} onChange={e => setCollection({ ...collection, type: e.target.value })}>{[["MALL", "Mall"], ["SHOPPING_CENTER", "Shopping centre"], ["TRANSIT_HUB", "Transit hub"], ["PUBLIC_VENUE", "Public venue"]].map(x => <MenuItem key={x[0]} value={x[0]}>{x[1]}</MenuItem>)}</TextField>
            <TextField label="Collection point" placeholder="e.g. Mall of Africa – main entrance" value={collection.name} onChange={e => setCollection({ ...collection, name: e.target.value })} />
            <Alert severity="info">For safety, choose a public collection point. Home addresses are not accepted.</Alert>
            <Box><Typography variant="body2" fontWeight={750}>Seats</Typography><Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}><Button variant="outlined" onClick={() => setSeats(Math.max(1, seats - 1))}>−</Button><Typography sx={{ minWidth: 40, textAlign: "center", fontWeight: 900 }}>{seats}</Typography><Button variant="outlined" onClick={() => setSeats(Math.min(ride.availableSeats, seats + 1))}>+</Button></Stack></Box>
            <Box><Typography variant="body2" fontWeight={750}>Bags</Typography><Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}><Button variant="outlined" onClick={() => setBags(Math.max(0, bags - 1))}>−</Button><Typography sx={{ minWidth: 40, textAlign: "center", fontWeight: 900 }}>{bags}</Typography><Button variant="outlined" onClick={() => setBags(Math.min(ride.luggageCapacity, bags + 1))}>+</Button></Stack></Box>
            {error && <Alert severity="error">{error}</Alert>}
            <Box><Typography>Fare: R{(Number(ride.pricePerSeat) * seats).toFixed(2)}</Typography><Typography color="text.secondary">Service fee: R{calculateFees(Number(ride.pricePerSeat) * seats).customerFee.toFixed(2)}</Typography><Typography variant="h5" fontWeight={900}>Total: R{calculateFees(Number(ride.pricePerSeat) * seats).totalCharge.toFixed(2)}</Typography><Typography variant="caption" color="text.secondary">Cash payments are not accepted.</Typography></Box>
            <Button size="large" variant="contained" disabled={busy || !faceVerified || ride.availableSeats < 1} onClick={book}>{busy ? <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />Starting secure payment…</> : faceVerified ? "Continue to payment" : "Verify identity to continue"}</Button>
          </Stack>
        </Paper>
      </Box>
    </> : <Typography sx={{ py: 8, textAlign: "center" }}>Ride not found.</Typography>}
  </Box></Fade><FaceCaptureDialog open={faceOpen} mode="RIDE" rideId={id} onClose={()=>setFaceOpen(false)} onComplete={(d)=>{setFaceOpen(false);setFaceVerified(d?.rideVerification?.status === "VERIFIED");setError(d?.message || "Face verification completed.")}}/></DashboardShell></AuthGuard>;
}
