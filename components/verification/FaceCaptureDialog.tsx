"use client";
import { Alert, Box, Dialog, DialogContent, IconButton, LinearProgress, Stack, Typography, useMediaQuery } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingButton from "@/components/loading/LoadingButton";

function cameraErrorMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") return "Camera permission was blocked. Allow camera access for ReaGae, then try again.";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "No camera was found. Connect or enable a camera and try again.";
  if (name === "NotReadableError" || name === "TrackStartError") return "The camera is already being used by another app or browser tab. Close it there and try again.";
  if (name === "SecurityError") return "Camera access requires HTTPS (localhost is also supported). Open ReaGae securely and allow camera access.";
  return error instanceof Error ? error.message : "Camera access is required for face verification.";
}

export default function FaceCaptureDialog({ open, mode, onClose, onComplete, rideId }: { open: boolean; mode: "INITIAL" | "RIDE"; rideId?: string; onClose?: () => void; onComplete: (result: any) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [token, setToken] = useState("");
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState<"preparing" | "permission" | "camera">("preparing");
  const [permissionState, setPermissionState] = useState<PermissionState | "unknown">("unknown");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStarted(false);
  }, []);

  // IMPORTANT: the video element is only mounted after setStarted(true). Attaching
  // srcObject in the same tick as setStarted caused the old dark/black preview.
  useEffect(() => {
    if (!started || !streamRef.current || !videoRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("autoplay", "true");
    void video.play().catch(() => setError("The camera opened but the preview could not start. Tap Try camera again."));
  }, [started]);

  const checkPermission = useCallback(async () => {
    try {
      if (!navigator.permissions?.query) return;
      const result = await navigator.permissions.query({ name: "camera" as PermissionName });
      setPermissionState(result.state);
    } catch { setPermissionState("unknown"); }
  }, []);

  const startCamera = useCallback(async (preparedToken?: string) => {
    setError(""); setCameraBusy(true);
    try {
      const activeToken = preparedToken || token;
      if (!activeToken) throw new Error("Secure verification is still preparing. Please wait a moment and try again.");
      if (!window.isSecureContext) throw new Error("Camera access requires a secure HTTPS connection. On localhost, use http://localhost.");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser does not provide camera access. Please use an up-to-date Chrome, Edge, Safari or Firefox browser.");
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      streamRef.current = stream;
      setPermissionState("granted");
      setStage("camera");
      setStarted(true);
    } catch (e) {
      setStage("permission"); await checkPermission(); setError(cameraErrorMessage(e));
    } finally { setCameraBusy(false); }
  }, [checkPermission, stopCamera, token]);

  useEffect(() => {
    if (!open) { stopCamera(); setToken(""); setStage("preparing"); setError(""); setPermissionState("unknown"); return; }
    let cancelled = false;
    setStage("preparing"); setError(""); setPermissionState("unknown");
    void checkPermission();
    fetch("/api/verification/face", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, rideId }) })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not prepare verification."); return d; })
      .then((d) => {
        if (cancelled) return;
        const u = new URL(d.url, window.location.origin);
        const parts = u.pathname.split("/");
        const t = decodeURIComponent(parts[parts.length - 1]);
        setToken(t); setStage("permission"); void startCamera(t);
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not prepare verification."); });
    return () => { cancelled = true; stopCamera(); };
  }, [open, mode, rideId, checkPermission, stopCamera]);

  const capture = async () => {
    const video = videoRef.current;
    if (!video || !token) return;
    setBusy(true); setError("");
    try {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) throw new Error("The camera is still starting. Please wait until your face is visible, then try again.");
      if (video.paused) await video.play();
      const canvas = document.createElement("canvas"); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const context = canvas.getContext("2d"); if (!context) throw new Error("Your browser could not prepare the camera image. Please try again.");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const selfie = canvas.toDataURL("image/jpeg", 0.92);
      const r = await fetch("/api/verification/face/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, selfie }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || `Face verification failed (HTTP ${r.status}).`);
      stopCamera(); onComplete(d);
    } catch (e) { setError(e instanceof Error ? e.message : "We could not submit the capture."); }
    finally { setBusy(false); }
  };

  const permissionBlocked = permissionState === "denied";
  return <Dialog open={open} fullWidth maxWidth="md" fullScreen={isMobile} onClose={() => (!busy && mode !== "INITIAL") && onClose?.()} disableEscapeKeyDown={busy || mode === "INITIAL"} aria-labelledby="face-dialog-title" slotProps={{ paper: { sx: { m: { xs: 0, sm: 2 }, width: { xs: "100%", sm: "calc(100% - 32px)" }, maxHeight: { xs: "100dvh", sm: "calc(100dvh - 32px)" } } } }}>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.72fr 1.28fr" }, minHeight: { md: 620 }, bgcolor: "#fff" }}>
      <Box sx={{ p: { xs: 2.5, sm: 4, md: 5 }, color: "#fff", background: "linear-gradient(145deg,#6D6AF7 0%,#514ED0 58%,#3E3BA8 100%)", position: "relative", overflow: "hidden", minHeight: { xs: 210, md: "auto" } }}>
        <Box sx={{ position: "relative", zIndex: 1 }}><Stack direction="row" gap={1.2} alignItems="center"><Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,.14)" }}><VerifiedUserRoundedIcon /></Box><Typography fontWeight={950} fontSize="1.25rem">ReaGae</Typography></Stack><Typography variant="overline" sx={{ display: "block", mt: 5, opacity: .75, fontWeight: 900, letterSpacing: ".12em" }}>{mode === "RIDE" ? "RIDE REQUEST SECURITY" : "FIRST-TIME VERIFICATION"}</Typography><Typography sx={{ mt: 1, fontSize: { xs: "1.75rem", md: "2.5rem" }, fontWeight: 900, lineHeight: 1.05 }}> {mode === "RIDE" ? "Confirm the rider behind this request." : "Let’s verify the person behind the account."}</Typography><Typography sx={{ mt: 2, color: "rgba(255,255,255,.78)", lineHeight: 1.7 }}>{mode === "RIDE" ? "A fresh face check is required for this ride." : "Your live face is compared with the face captured from your government ID."}</Typography><Stack gap={1.1} sx={{ mt: 4 }}>{["Camera access is requested only for this check", "The live capture is compared with the ID image", "Verification events are recorded for safety"].map((x) => <Stack key={x} direction="row" gap={1} alignItems="center"><SecurityRoundedIcon sx={{ fontSize: 19 }} /><Typography variant="body2" fontWeight={700}>{x}</Typography></Stack>)}</Stack></Box>
      </Box>
      <Box sx={{ position: "relative", minWidth: 0, overflow: "auto" }}>{mode !== "INITIAL" && <IconButton onClick={() => !busy && onClose?.()} disabled={busy} sx={{ position: "absolute", right: 12, top: 12, zIndex: 3 }}><CloseRoundedIcon /></IconButton>}<DialogContent sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="overline" color="primary" fontWeight={900}>SECURE CAMERA CHECK</Typography><Typography id="face-dialog-title" variant="h4">Confirm it’s you</Typography></Box><CameraAltRoundedIcon color="primary" /></Stack><LinearProgress variant="determinate" value={stage === "camera" ? 100 : stage === "permission" ? 55 : 25} sx={{ mt: 2.5, height: 4 }} /><Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{stage === "camera" ? "Camera ready. Position your face inside the guide and capture." : stage === "permission" ? "Allow camera access to continue." : "Preparing a secure verification session…"}</Typography>
        <Box sx={{ mt: 2.5, aspectRatio: "4 / 3", bgcolor: "#0A1020", position: "relative", overflow: "hidden" }}>{started ? <video ref={videoRef} muted autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", background: "#0A1020" }} /> : <Stack alignItems="center" justifyContent="center" gap={1.2} sx={{ position: "absolute", inset: 0, color: "rgba(255,255,255,.72)" }}>{cameraBusy ? <CameraAltRoundedIcon sx={{ fontSize: 54 }} /> : permissionBlocked ? <SettingsRoundedIcon sx={{ fontSize: 54 }} /> : <CameraAltRoundedIcon sx={{ fontSize: 54 }} />}<Typography fontWeight={800}>{cameraBusy ? "Requesting camera permission…" : permissionBlocked ? "Camera permission is blocked" : "Camera preview"}</Typography></Stack>}{started && <Box sx={{ position: "absolute", inset: "10% 25%", border: "2px solid rgba(255,255,255,.88)", boxShadow: "0 0 0 999px rgba(0,0,0,.20)", pointerEvents: "none" }} />}</Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Stack sx={{ mt: 2.5 }}>{!started ? <LoadingButton fullWidth variant="contained" size="large" loading={cameraBusy || !token} onClick={() => void startCamera()} startIcon={permissionBlocked ? <RefreshRoundedIcon /> : <CameraAltRoundedIcon />} sx={{ minHeight: 54 }}>{permissionBlocked ? "Try camera again" : token ? "Allow camera & continue" : "Preparing secure check…"}</LoadingButton> : <LoadingButton fullWidth variant="contained" size="large" loading={busy} onClick={capture} startIcon={<VerifiedUserRoundedIcon />} sx={{ minHeight: 54 }}>Capture and verify</LoadingButton>}</Stack><Stack direction="row" gap={1} alignItems="flex-start" sx={{ mt: 2.2 }}><LockRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} /><Typography variant="caption" color="text.secondary">Only use your own face. The live image is compared with the captured ID image for the stated verification purpose.</Typography></Stack></DialogContent></Box>
    </Box>
  </Dialog>;
}
