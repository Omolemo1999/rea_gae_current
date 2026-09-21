"use client";
import { Alert, Box, Dialog, DialogContent, IconButton, LinearProgress, Stack, Typography, useMediaQuery } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingButton from "@/components/loading/LoadingButton";

function cameraError(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError") return "Camera permission was blocked. Allow camera access for ReaGae and try again.";
  if (name === "NotFoundError" || name === "DevicesNotFoundError") return "No camera was found. Connect or enable a camera and try again.";
  if (name === "NotReadableError" || name === "TrackStartError") return "The camera is already being used by another app or tab. Close it and try again.";
  return error instanceof Error ? error.message : "Camera access is required to capture your ID.";
}

export default function IdentityDocumentCapture({ open, onClose, onCaptured, submitUrl = "/api/verification/rider", type = "ID" }: { open: boolean; onClose: () => void; onCaptured: (result: any) => void; submitUrl?: string; type?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStarted(false);
  }, []);

  // Attach after the <video> has mounted. This prevents a valid stream from
  // being lost between setState() and React rendering the video element.
  useEffect(() => {
    if (!started || !streamRef.current || !videoRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("autoplay", "true");
    void video.play().catch(() => setError("The camera opened but the preview could not start. Tap Try camera again."));
  }, [started]);

  const start = useCallback(async () => {
    setError(""); setCameraBusy(true);
    try {
      if (!window.isSecureContext) throw new Error("Camera access requires HTTPS. On your development machine, use http://localhost.");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser does not support camera access.");
      stop();
      // Rear camera is preferred for the physical ID card. If the browser does
      // not expose it, the ideal constraint safely falls back to another camera.
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = stream;
      setStarted(true);
    } catch (e) { setError(cameraError(e)); }
    finally { setCameraBusy(false); }
  }, [stop]);

  useEffect(() => {
    if (!open) { stop(); setError(""); return; }
    void start();
    return () => stop();
  }, [open, start, stop]);

  const capture = async () => {
    const video = videoRef.current;
    if (!video) return;
    setBusy(true); setError("");
    try {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) throw new Error("The camera is still starting. Wait until the ID is visible, then try again.");
      if (video.paused) await video.play();
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Could not prepare the ID image.");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/jpeg", 0.94);
      if (data.length < 2000) throw new Error("The camera produced an empty ID image. Please retake it.");
      const r = await fetch(submitUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, fileName: "government-id-camera.jpg", mimeType: "image/jpeg", data }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Could not save the captured ID.");
      stop(); onCaptured(d);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not capture your ID."); }
    finally { setBusy(false); }
  };

  return <Dialog open={open} fullWidth maxWidth="md" fullScreen={isMobile} onClose={() => !busy && onClose()} aria-labelledby="id-camera-title" slotProps={{ paper: { sx: { m: { xs: 0, sm: 2 }, width: { xs: "100%", sm: "calc(100% - 32px)" } } } }}>
    <DialogContent sx={{ p: 0 }}><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: ".7fr 1.3fr" } }}>
      <Box sx={{ p: { xs: 3, md: 4 }, color: "#fff", background: "linear-gradient(145deg,#315CD6,#183B9E)" }}><Stack direction="row" gap={1.2} alignItems="center"><BadgeRoundedIcon /><Typography fontWeight={900} fontSize="1.2rem">ReaGae ID capture</Typography></Stack><Typography id="id-camera-title" sx={{ mt: 5, fontSize: "2rem", fontWeight: 900, lineHeight: 1.05 }}>Capture the front of your ID.</Typography><Typography sx={{ mt: 2, color: "rgba(255,255,255,.8)", lineHeight: 1.7 }}>No PDF or file upload is used for identity. Photograph the physical ID card with the camera, then your live face will be compared with the face visible on this captured ID.</Typography><Stack gap={1} sx={{ mt: 3 }}><Typography variant="body2">• Keep the entire card inside the guide.</Typography><Typography variant="body2">• Avoid glare and shadows.</Typography><Typography variant="body2">• Make sure the portrait/photo on the ID is sharp.</Typography></Stack></Box>
      <Box sx={{ p: { xs: 2.5, md: 4 } }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="overline" color="primary" fontWeight={900}>CAMERA ID CAPTURE</Typography><Typography variant="h4">Front of ID</Typography></Box><IconButton onClick={() => !busy && onClose()} disabled={busy}><CloseRoundedIcon /></IconButton></Stack><LinearProgress variant="determinate" value={started ? 100 : 30} sx={{ mt: 2, height: 4 }} /><Box sx={{ mt: 2.5, aspectRatio: "16 / 10", bgcolor: "#09101D", position: "relative", overflow: "hidden" }}>{started ? <video ref={videoRef} muted autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", background: "#09101D" }} /> : <Stack sx={{ position: "absolute", inset: 0, color: "rgba(255,255,255,.75)" }} alignItems="center" justifyContent="center" gap={1}><CameraAltRoundedIcon sx={{ fontSize: 52 }} /><Typography>{cameraBusy ? "Opening camera…" : "Camera preview"}</Typography></Stack>}{started && <Box sx={{ position: "absolute", left: "6%", right: "6%", top: "18%", bottom: "18%", border: "2px solid rgba(255,255,255,.95)", boxShadow: "0 0 0 999px rgba(0,0,0,.35)", pointerEvents: "none" }} />}</Box><Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.2 }}>Use the rear camera where available. Do not photograph a screen or photocopy.</Typography>{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}<LoadingButton fullWidth variant="contained" size="large" loading={busy || cameraBusy} disabled={!started} onClick={capture} startIcon={<CameraAltRoundedIcon />} sx={{ mt: 2, minHeight: 54 }}>Capture ID securely</LoadingButton><Stack direction="row" gap={1} sx={{ mt: 2 }}><LockRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} /><Typography variant="caption" color="text.secondary">The captured image is stored as an image, not a PDF, and is used for identity verification.</Typography></Stack></Box>
    </Box></DialogContent>
  </Dialog>;
}
