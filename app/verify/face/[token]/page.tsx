"use client";

import { Alert, Box, Button, CircularProgress, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PhoneFaceVerification() {
  const { token } = useParams<{ token: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const mode = params.get("mode") === "ride" ? "ride" : "initial";
  const rideId = params.get("rideId");

  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  const start = async () => {
    try {
      setError("");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access is not supported by this browser.");
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } }, audio: false });
      setStream(s);
      setStarted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Camera access is required. Please allow camera access and try again.");
    }
  };

  const capture = async () => {
    if (!videoRef.current) return;
    setBusy(true); setError("");
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 720;
    canvas.height = videoRef.current.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const selfie = canvas.toDataURL("image/jpeg", .84);
    try {
      const r = await fetch("/api/verification/face/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, selfie }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Capture failed.");
      stream?.getTracks().forEach((t) => t.stop());
      if (mode === "ride" && rideId) router.replace(`/rider/rides/${rideId}?face=complete`);
      else router.replace("/rider/verification?face=complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not submit the capture.");
    } finally { setBusy(false); }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: { xs: 1.5, sm: 3 }, background: "radial-gradient(circle at 20% 10%,rgba(49,92,214,.15),transparent 35%),radial-gradient(circle at 80% 90%,rgba(22,160,133,.12),transparent 30%),#F5F8FC" }}>
      <Paper elevation={0} sx={{ width: "100%", maxWidth: 620, p: { xs: 2, sm: 4 }, borderRadius: 5, border: "1px solid", borderColor: "divider", boxShadow: "0 28px 80px rgba(18,33,59,.12)" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
          <Box><Typography variant="overline" color="primary" fontWeight={900}>ReaGae secure verification</Typography><Typography variant="h4" sx={{ mt: .5 }}>Confirm it&apos;s you</Typography></Box>
          <Box sx={{ width: 46, height: 46, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "rgba(49,92,214,.08)", color: "primary.main" }}><LockRoundedIcon /></Box>
        </Stack>
        <LinearProgress variant="determinate" value={started ? 75 : 35} sx={{ mt: 2.5, height: 7, borderRadius: 7 }} />
        <Typography color="text.secondary" sx={{ mt: 1 }}>Step {started ? "3" : "2"} of 3 · {mode === "ride" ? "Identity check for this ride request" : "Live face verification"}</Typography>

        <Box sx={{ mt: 3, aspectRatio: "1/1", maxHeight: "min(62vh,560px)", borderRadius: 4, overflow: "hidden", background: "#0B1220", display: "grid", placeItems: "center", position: "relative", border: "1px solid rgba(255,255,255,.08)" }}>
          {started ? <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} /> : <Stack alignItems="center" gap={1.5}><CameraAltRoundedIcon sx={{ fontSize: 64, color: "rgba(255,255,255,.65)" }} /><Typography sx={{ color: "rgba(255,255,255,.7)" }}>Camera preview</Typography></Stack>}
          {started && <Box sx={{ position: "absolute", inset: "10%", border: "2px solid rgba(255,255,255,.8)", borderRadius: "48%", pointerEvents: "none" }} />}
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Stack gap={1.5} sx={{ mt: 2.5 }}>
          {!started ? <Button variant="contained" size="large" onClick={start} startIcon={<CameraAltRoundedIcon />}>Enable camera</Button> :
            <Button variant="contained" size="large" disabled={busy} onClick={capture} startIcon={busy ? <CircularProgress size={20} color="inherit" /> : <CheckCircleRoundedIcon />}>{busy ? "Securing verification…" : "Capture & continue"}</Button>}
          <Typography variant="caption" color="text.secondary" textAlign="center">Your capture is processed for identity verification. A ride-request check is linked to the specific ride and does not require manual agent approval.</Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
