"use client";
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
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
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return "Camera permission was blocked. Allow camera access for ReaGae in your browser or device settings, then select Try camera again.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "No camera was found. Connect or enable a camera and try again.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "The camera is already being used by another app or browser tab. Close it there and try again.";
  }
  if (name === "SecurityError") {
    return "Your browser blocked camera access for security reasons. Open ReaGae over HTTPS and allow camera access.";
  }
  return error instanceof Error ? error.message : "Camera access is required for face verification.";
}

export default function FaceCaptureDialog({
  open,
  mode,
  onClose,
  onComplete,
  rideId,
}: {
  open: boolean;
  mode: "INITIAL" | "RIDE";
  rideId?: string;
  onClose?: () => void;
  onComplete: (result: any) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const streamRef = useRef<MediaStream | null>(null);
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

  const checkPermission = useCallback(async () => {
    try {
      if (!navigator.permissions?.query) return;
      const result = await navigator.permissions.query({ name: "camera" as PermissionName });
      setPermissionState(result.state);
      result.onchange = () => setPermissionState(result.state);
    } catch {
      setPermissionState("unknown");
    }
  }, []);

  const startCamera = useCallback(async (preparedToken?: string) => {
    setError("");
    setCameraBusy(true);

    try {
      const activeToken = preparedToken || token;
      if (!activeToken) throw new Error("Secure verification is still preparing. Please wait a moment and try again.");
      if (!window.isSecureContext) {
        throw new Error("Camera access requires a secure HTTPS connection. On localhost, use http://localhost; on a phone, use an HTTPS address.");
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not provide camera access. Please use an up-to-date Chrome, Edge, Safari or Firefox browser.");
      }

      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setPermissionState("granted");
      setStarted(true);
      setStage("camera");

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play();
      }
    } catch (e) {
      setStage("permission");
      await checkPermission();
      setError(cameraErrorMessage(e));
    } finally {
      setCameraBusy(false);
    }
  }, [checkPermission, stopCamera]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setToken("");
      setStage("preparing");
      setError("");
      setPermissionState("unknown");
      return;
    }

    let cancelled = false;
    setStage("preparing");
    setError("");
    setPermissionState("unknown");

    void checkPermission();
    fetch("/api/verification/face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, rideId }),
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Could not prepare verification.");
        const u = new URL(d.url);
        const parts = u.pathname.split("/");
        const t = decodeURIComponent(parts[parts.length - 1]);
        if (!cancelled) {
          setToken(t);
          setStage("permission");
          // Request camera access immediately so desktop and mobile browsers show their native permission prompt.
          void startCamera(t);
        }
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not prepare verification."));

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, mode, rideId, checkPermission, stopCamera]);

  const capture = async () => {
    if (!videoRef.current || !token) return;
    setBusy(true);
    setError("");
    if (videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      setBusy(false);
      setError("The camera is still starting. Please wait until your face is visible, then try again.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setBusy(false);
      setError("Your browser could not prepare the camera image. Please try again.");
      return;
    }
    // Do not mirror the submitted biometric sample. The preview can be mirrored,
    // but the provider should receive the natural camera orientation.
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const selfie = canvas.toDataURL("image/jpeg", 0.92);
    if (!selfie || selfie.length < 1000) {
      setBusy(false);
      setError("The camera did not produce a usable image. Please retake the capture.");
      return;
    }
    try {
      const r = await fetch("/api/verification/face/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, selfie }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || `Face verification failed (HTTP ${r.status}).`);
      stopCamera();
      onComplete(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not submit the capture.");
    } finally {
      setBusy(false);
    }
  };

  const permissionBlocked = permissionState === "denied";

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      onClose={() => (!busy && mode === "INITIAL" ? undefined : onClose?.())}
      disableEscapeKeyDown={busy || mode === "INITIAL"}
      aria-labelledby="face-dialog-title"
      slotProps={{
        paper: {
          sx: {
            m: { xs: 0, sm: 2 },
            width: { xs: "100%", sm: "calc(100% - 32px)" },
            maxHeight: { xs: "100dvh", sm: "calc(100dvh - 32px)" },
          },
        },
      }}
    >
      <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.72fr 1.28fr" },
            minHeight: { md: 620 },
            bgcolor: "#fff",
          }}
        >
          <Box
            sx={{
              p: { xs: 2.5, sm: 4, md: 5 },
              color: "#fff",
              background: "linear-gradient(145deg,#6D6AF7 0%,#514ED0 58%,#3E3BA8 100%)",
              position: "relative",
              overflow: "hidden",
              minHeight: { xs: 210, md: "auto" },
            }}
          >
            <Box sx={{ position: "absolute", width: 250, height: 250, right: -120, top: -80, border: "70px solid rgba(255,255,255,.09)", transform: "rotate(18deg)" }} />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Stack direction="row" gap={1.2} alignItems="center">
                <Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)" }}>
                  <VerifiedUserRoundedIcon />
                </Box>
                <Typography fontWeight={950} fontSize="1.25rem">ReaGae</Typography>
              </Stack>
              <Typography variant="overline" sx={{ display: "block", mt: 5, opacity: .75, fontWeight: 900, letterSpacing: ".12em" }}>
                {mode === "RIDE" ? "RIDE REQUEST SECURITY" : "FIRST-TIME VERIFICATION"}
              </Typography>
              <Typography sx={{ mt: 1, fontSize: { xs: "1.75rem", md: "2.5rem" }, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-.05em" }}>
                {mode === "RIDE" ? "Confirm the rider behind this request." : "Let’s verify the person behind the account."}
              </Typography>
              <Typography sx={{ mt: 2, color: "rgba(255,255,255,.78)", lineHeight: 1.7 }}>
                {mode === "RIDE"
                  ? "A fresh face check is required for this ride. It creates a time-stamped identity record and does not require agent approval."
                  : "Your first identity check links your rider account to your verified face. Later ride requests use a fresh check for that specific journey."}
              </Typography>
              <Stack gap={1.1} sx={{ mt: 4 }}>
                {["Camera access is requested only for this check", "The capture is sent securely for verification", "Verification events are recorded for safety"].map((text) => (
                  <Stack key={text} direction="row" gap={1} alignItems="center">
                    <SecurityRoundedIcon sx={{ fontSize: 19 }} />
                    <Typography variant="body2" fontWeight={700}>{text}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Box>

          <Box sx={{ position: "relative", minWidth: 0, overflow: "auto" }}>
            {mode !== "INITIAL" && (
              <IconButton onClick={() => !busy && onClose?.()} disabled={busy} sx={{ position: "absolute", right: 12, top: 12, zIndex: 3 }} aria-label="Close verification">
                <CloseRoundedIcon />
              </IconButton>
            )}
            <DialogContent sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                <Box>
                  <Typography variant="overline" color="primary" fontWeight={900}>SECURE CAMERA CHECK</Typography>
                  <Typography id="face-dialog-title" variant="h4" sx={{ mt: .4 }}>Confirm it’s you</Typography>
                </Box>
                <Box sx={{ color: "primary.main", display: "grid", placeItems: "center" }}><CameraAltRoundedIcon /></Box>
              </Stack>

              <LinearProgress variant="determinate" value={stage === "camera" ? 100 : stage === "permission" ? 55 : 25} sx={{ mt: 2.5, height: 4, borderRadius: 0 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                {stage === "camera" ? "Camera ready. Position your face inside the guide and capture." : stage === "permission" ? "Your browser will ask for camera permission. Choose Allow to continue." : "Preparing a secure verification session…"}
              </Typography>

              <Box sx={{ mt: 2.5, aspectRatio: "4 / 3", bgcolor: "#0A1020", position: "relative", overflow: "hidden", border: "1px solid #172033" }}>
                {started ? (
                  <video ref={videoRef} muted autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
                ) : (
                  <Stack alignItems="center" justifyContent="center" gap={1.2} sx={{ position: "absolute", inset: 0, color: "rgba(255,255,255,.72)", p: 3, textAlign: "center" }}>
                    {cameraBusy ? <Box sx={{ animation: "reagaePulse 1.2s ease-in-out infinite" }}><CameraAltRoundedIcon sx={{ fontSize: 54 }} /></Box> : permissionBlocked ? <SettingsRoundedIcon sx={{ fontSize: 54 }} /> : <CameraAltRoundedIcon sx={{ fontSize: 54 }} />}
                    <Typography fontWeight={800}>{cameraBusy ? "Requesting camera permission…" : permissionBlocked ? "Camera permission is blocked" : "Camera preview"}</Typography>
                  </Stack>
                )}
                {started && <Box sx={{ position: "absolute", inset: "10% 25%", border: "2px solid rgba(255,255,255,.88)", borderRadius: 0, boxShadow: "0 0 0 999px rgba(0,0,0,.20)", pointerEvents: "none" }} />}
              </Box>

              {error && <Alert severity="error" sx={{ mt: 2 }} icon={<CameraAltRoundedIcon />}>
                <Typography variant="body2" fontWeight={750}>{error}</Typography>
                {(permissionBlocked || error.toLowerCase().includes("https")) && (
                  <Typography variant="caption" component="div" sx={{ mt: .7, lineHeight: 1.6 }}>
                    <strong>To enable it:</strong> Chrome/Edge: tap the camera icon in the address bar and choose Allow. Safari/iPhone: Settings → Safari → Camera → Allow, then return to ReaGae. Android: browser site settings → Camera → Allow. If this is a deployed site, use HTTPS.
                  </Typography>
                )}
              </Alert>}

              <Stack gap={1.2} sx={{ mt: 2.5 }}>
                {!started ? (
                  <LoadingButton
                    fullWidth
                    variant="contained"
                    size="large"
                    loading={cameraBusy || !token}
                    onClick={startCamera}
                    startIcon={permissionBlocked ? <RefreshRoundedIcon /> : <CameraAltRoundedIcon />}
                    sx={{ minHeight: 54 }}
                  >
                    {permissionBlocked ? "Try camera again" : token ? "Allow camera & continue" : "Preparing secure check…"}
                  </LoadingButton>
                ) : (
                  <LoadingButton fullWidth variant="contained" size="large" loading={busy} onClick={capture} startIcon={<VerifiedUserRoundedIcon />} sx={{ minHeight: 54 }}>
                    Capture and verify
                  </LoadingButton>
                )}
              </Stack>

              <Stack direction="row" gap={1} alignItems="flex-start" sx={{ mt: 2.2 }}>
                <LockRoundedIcon sx={{ fontSize: 18, color: "text.secondary", mt: .15 }} />
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Only use your own face. ReaGae uses this capture for the stated verification and safety purpose described in the Privacy Policy.
                </Typography>
              </Stack>
            </DialogContent>
          </Box>
        </Box>
    </Dialog>
  );
}
