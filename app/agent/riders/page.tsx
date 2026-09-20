"use client";

import { Alert, Box, Button, Chip, Divider, Fade, Paper, Skeleton, Stack, Typography } from "@mui/material";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import LoadingButton from "@/components/loading/LoadingButton";
import { useEffect, useState } from "react";

const pretty = (value?: string) => value ? value.replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase()) : "Not Started";

export default function RiderReview() {
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const load = () => fetch("/api/agent/riders", { cache: "no-store" }).then(r => r.json()).then(d => setItems(d.riders || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const act = async (id: string, action: string, status: string, docId?: string) => {
    setMsg("");
    setBusyId(id);
    const r = await fetch(`/api/agent/riders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, status, documentId: docId }) });
    const d = await r.json();
    if (!r.ok) { setMsg(d.error || "Review action failed."); setBusyId(""); return; }
    setBusyId("");
    load();
  };

  return <AuthGuard role="AGENT"><DashboardShell role="AGENT"><Fade in timeout={500}><Box sx={{ minWidth: 0 }}>
    <Typography variant="h3">Rider verification & identity</Typography>
    <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 820 }}>Review first-time identity verification here. Fresh face checks made when a rider requests a specific ride are recorded below for audit and safety; they do not require agent approval.</Typography>
    {msg && <Alert sx={{ mt: 2 }} severity="error">{msg}</Alert>}

    <Stack gap={2} sx={{ mt: 3 }}>
      {loading ? [1,2,3].map(i => <Paper key={i} sx={{ p: 3, borderRadius: 0 }} elevation={0}><Skeleton width="40%" /><Skeleton width="70%" /><Skeleton height={80} /></Paper>) :
      items.map(r => <Paper key={r.id} elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 0, minWidth: 0 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
          <Box sx={{ minWidth: 0 }}><Typography variant="h6">{r.firstName} {r.lastName}</Typography><Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{r.email}</Typography></Box>
          <Stack direction="row" gap={1} flexWrap="wrap"><Chip label={`Identity: ${pretty(r.riderProfile?.identityVerificationStatus)}`} size="small" /><Chip label={`Face: ${pretty(r.riderProfile?.faceVerificationStatus)}`} size="small" /><Chip label={pretty(r.riderProfile?.verificationStatus)} color={r.riderProfile?.verificationStatus === "VERIFIED" ? "success" : "warning"} size="small" /></Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography fontWeight={850}>First-time identity evidence</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.2} sx={{ mt: 1.2 }} alignItems={{ sm: "center" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" fontWeight={750}>{r.document?.fileName || "No ID uploaded"}</Typography><Typography variant="caption" color="text.secondary">Document status: {pretty(r.document?.status)}</Typography></Box>
          {r.document && <Button component="a" href={r.document.data} target="_blank" variant="outlined">View ID</Button>}
          {r.document?.status !== "APPROVED" && r.document && <LoadingButton variant="contained" loading={busyId===r.id} onClick={() => act(r.id, "DOCUMENT", "APPROVED", r.document.id)}>Approve ID</LoadingButton>}
        </Stack>

        <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 0, bgcolor: "rgba(49,92,214,.045)", border: "1px solid rgba(49,92,214,.1)" }}>
          <Stack direction="row" gap={1.5} alignItems="center"><VerifiedUserRoundedIcon color="primary" /><Box sx={{ flex: 1, minWidth: 0 }}><Typography fontWeight={850}>Fresh ride-request face checks</Typography><Typography variant="caption" color="text.secondary">Informational audit trail — no approval action required.</Typography></Box></Stack>
          <Stack gap={1} sx={{ mt: 1.5 }}>
            {(r.rideVerifications || []).slice(0, 5).map((v: any) => <Stack key={v.id} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1} sx={{ p: 1.2, borderRadius: 0, bgcolor: "white" }}>
              <Box sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={750}>{v.rideId}</Typography><Typography variant="caption" color="text.secondary">{v.capturedAt ? new Date(v.capturedAt).toLocaleString() : "Capture pending"} · Face match: {pretty(v.faceMatchResult)}</Typography></Box>
              <Chip size="small" label={pretty(v.status)} color={v.status === "VERIFIED" ? "success" : v.status === "REJECTED" ? "error" : "warning"} />
            </Stack>)}
            {!r.rideVerifications?.length && <Typography variant="caption" color="text.secondary">No ride-request face checks recorded yet.</Typography>}
          </Stack>
        </Paper>

        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
          {r.riderProfile?.faceVerificationStatus === "PENDING_REVIEW" && <LoadingButton variant="outlined" loading={busyId===r.id} onClick={() => act(r.id, "FACE", "VERIFIED")}>Approve first-time face</LoadingButton>}
          {r.riderProfile?.faceVerificationStatus !== "REJECTED" && r.riderProfile?.verificationStatus !== "VERIFIED" && <LoadingButton color="error" variant="outlined" loading={busyId===r.id} onClick={() => act(r.id, "FACE", "REJECTED")}>Reject face</LoadingButton>}
          {r.riderProfile?.faceVerificationStatus === "VERIFIED" && <LoadingButton variant="contained" color="success" loading={busyId===r.id} onClick={() => act(r.id, "FINAL", "VERIFIED")}>Complete rider verification</LoadingButton>}
        </Stack>
      </Paper>)}
      {!loading && !items.length && <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 0 }}><Typography>No rider verification cases waiting.</Typography></Paper>}
    </Stack>
  </Box></Fade></DashboardShell></AuthGuard>;
}
