"use client";

import { Alert, Box, Button, Chip, CircularProgress, Fade, Paper, Stack, Typography } from "@mui/material";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import Face6RoundedIcon from "@mui/icons-material/Face6Rounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const pretty = (value?: string) => value ? value.replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase()) : "Not Started";

export default function RiderVerification() {
  const params = useSearchParams();
  const [p, setP] = useState<any>();
  const [doc, setDoc] = useState<any>();
  const [faceUrl, setFaceUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await fetch("/api/verification/rider", { cache: "no-store" });
    const d = await r.json();
    setP(d.profile); setDoc(d.document);
    if (params.get("face") === "complete") setMsg("Your live face capture was received. An agent will complete the first-time verification review.");
  };
  useEffect(() => { load(); }, [params]);

  const upload = async (file: File) => {
    setBusy(true); setMsg("");
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const r = await fetch("/api/verification/rider", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, mimeType: file.type, data: reader.result }) });
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Upload failed.");
          setMsg(d.message || "ID uploaded successfully."); await load();
        } catch (e) { setMsg(e instanceof Error ? e.message : "Upload failed."); }
        finally { setBusy(false); }
      };
      reader.readAsDataURL(file);
    } catch { setBusy(false); setMsg("We could not read that document."); }
  };

  const startFace = async () => {
    setBusy(true); setMsg(""); setFaceUrl("");
    try {
      const r = await fetch("/api/verification/face", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "INITIAL" }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not start verification.");
      setFaceUrl(d.url); setMsg("Your secure camera session is ready. Open it on a phone or this device.");
    } catch (e) { setMsg(e instanceof Error ? e.message : "Could not start verification."); }
    finally { setBusy(false); }
  };

  const idReady = doc?.status === "APPROVED";
  const faceReady = p?.faceVerificationStatus === "VERIFIED";
  const fullyVerified = p?.verificationStatus === "VERIFIED";

  return (
    <AuthGuard role="RIDER">
      <DashboardShell role="RIDER">
        <Fade in timeout={600}>
          <Box>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} alignItems={{ sm: "center" }}>
              <Box><Typography variant="h3">Your identity & safety</Typography><Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>Complete this once before your first ride. After that, ReaGae asks for a fresh face check every time you request a ride.</Typography></Box>
              <Chip icon={<SecurityRoundedIcon />} label={fullyVerified ? "Verified" : pretty(p?.verificationStatus)} color={fullyVerified ? "success" : "warning"} />
            </Stack>

            {msg && <Alert severity={msg.toLowerCase().includes("error") || msg.toLowerCase().includes("could not") ? "error" : "info"} sx={{ mt: 2 }}>{msg}</Alert>}

            <Box sx={{ mt: 3, borderRadius: 5, overflow: "hidden", position: "relative", height: { xs: 150, sm: 210 }, boxShadow: "0 18px 45px rgba(18,33,59,.10)" }}>
              <Box component="img" src="/ReaGae_Banner.png" alt="ReaGae travel and safety" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(13,26,46,.76),rgba(13,26,46,.15))", display: "flex", alignItems: "center", p: { xs: 2.5, sm: 4 } }}>
                <Box sx={{ maxWidth: 560, color: "white" }}><Typography variant="h5" fontWeight={900}>Your identity protects the journey.</Typography><Typography sx={{ mt: .6, opacity: .86 }}>Verification is designed to make sure the person requesting a ride is the verified account holder.</Typography></Box>
              </Box>
            </Box>

            <Paper elevation={0} sx={{ mt: 3, p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 5, background: "linear-gradient(145deg,#fff,rgba(49,92,214,.025))" }}>
              <Typography variant="h5">First-time rider verification</Typography>
              <Typography color="text.secondary" sx={{ mt: .6 }}>One guided flow. No unnecessary back-and-forth.</Typography>

              <Stack gap={1.5} sx={{ mt: 3 }}>
                <Paper elevation={0} sx={{ p: 2.2, borderRadius: 4, border: "1px solid", borderColor: idReady ? "success.main" : "divider", bgcolor: idReady ? "rgba(21,154,112,.055)" : "rgba(49,92,214,.035)" }}>
                  <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={2}>
                    <Box sx={{ width: 48, height: 48, flex: "0 0 auto", borderRadius: 3, display: "grid", placeItems: "center", bgcolor: idReady ? "success.main" : "rgba(49,92,214,.10)", color: idReady ? "white" : "primary.main" }}>{idReady ? <CheckCircleRoundedIcon /> : <BadgeRoundedIcon />}</Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={850}>1. Government ID</Typography><Typography variant="body2" color="text.secondary">{doc?.fileName ? `Uploaded: ${doc.fileName}` : "Upload a clear ID document. Your file name will remain visible here."}</Typography>{doc?.status && <Typography variant="caption" color="text.secondary">Status: {pretty(doc.status)}</Typography>}</Box>
                    {!idReady && <Button component="label" variant="outlined" disabled={busy}>{busy ? <CircularProgress size={20} /> : doc ? "Replace ID" : "Upload ID"}<input hidden type="file" accept="image/*,.pdf" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></Button>}
                  </Stack>
                </Paper>

                <Paper elevation={0} sx={{ p: 2.2, borderRadius: 4, border: "1px solid", borderColor: faceReady ? "success.main" : "divider", bgcolor: faceReady ? "rgba(21,154,112,.055)" : "rgba(49,92,214,.035)" }}>
                  <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={2}>
                    <Box sx={{ width: 48, height: 48, flex: "0 0 auto", borderRadius: 3, display: "grid", placeItems: "center", bgcolor: faceReady ? "success.main" : "rgba(49,92,214,.10)", color: faceReady ? "white" : "primary.main" }}>{faceReady ? <CheckCircleRoundedIcon /> : <Face6RoundedIcon />}</Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={850}>2. Live face verification</Typography><Typography variant="body2" color="text.secondary">{faceReady ? "Your face capture is verified." : "A secure camera session confirms the person completing this account verification."}</Typography>{p?.faceVerificationStatus && <Typography variant="caption" color="text.secondary">Status: {pretty(p.faceVerificationStatus)}</Typography>}</Box>
                    {!faceReady && <Button variant="contained" disabled={!doc || busy || doc.status === "REJECTED"} onClick={startFace}>{busy ? <CircularProgress size={20} color="inherit" /> : "Start secure check"}</Button>}
                  </Stack>
                  {faceUrl && <Paper elevation={0} sx={{ mt: 2, p: 1.8, borderRadius: 3, bgcolor: "rgba(49,92,214,.055)" }}><Typography fontWeight={800}>Secure camera link ready</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Open this link on the device with the camera you want to use.</Typography><Button href={faceUrl} target="_blank" variant="outlined" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 1 }}>Open camera</Button></Paper>}
                </Paper>
              </Stack>

              <Alert severity="success" sx={{ mt: 2.5 }} icon={<SecurityRoundedIcon />}>Your identity information is protected and used for safety, verification and lawful service operations. It is not sold. Disclosures are limited to the purposes described in our <a href="/privacy">Privacy Policy</a>, including legal or serious safety requirements.</Alert>
            </Paper>
          </Box>
        </Fade>
      </DashboardShell>
    </AuthGuard>
  );
}
