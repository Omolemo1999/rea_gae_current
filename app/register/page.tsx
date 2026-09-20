"use client";

import { Alert, Box, Button, Checkbox, CircularProgress, Container, FormControl, FormControlLabel, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const LEGAL_VERSION = "2026-09-20";

export default function RegisterPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [role, setRole] = useState<"RIDER" | "DRIVER">((params.get("role") as "RIDER" | "DRIVER") || "RIDER");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!legalAccepted) return setError("Please accept the Privacy Policy and Terms & Conditions before registering.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role, legalAccepted, legalVersion: LEGAL_VERSION }),
      });
      const d = await r.json();
      if (!r.ok) return setError(d.error || "Registration failed.");
      router.replace("/verify");
    } catch {
      setError("We could not complete registration. Please check your connection and try again.");
    } finally { setBusy(false); }
  };

  return (
    <Box sx={{ minHeight: "100vh", py: { xs: 3, md: 7 }, px: 2, display: "grid", placeItems: "center", background: "radial-gradient(circle at 12% 12%, rgba(49,92,214,.15), transparent 30%), radial-gradient(circle at 88% 88%, rgba(19,160,130,.12), transparent 28%), #F6F9FD" }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 2.2, sm: 4 }, border: "1px solid", borderColor: "divider", borderRadius: 5, overflow: "hidden", boxShadow: "0 24px 70px rgba(18,33,59,.10)" }}>
          <Stack alignItems="center" sx={{ mb: 2.5 }}>
            <Box sx={{ width: 58, height: 58, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: "primary.main", color: "white", boxShadow: "0 12px 30px rgba(49,92,214,.25)" }}><ShieldRoundedIcon /></Box>
            <Typography variant="h4" sx={{ mt: 2, textAlign: "center" }}>Create your ReaGae account</Typography>
            <Typography color="text.secondary" sx={{ mt: .7, textAlign: "center" }}>A safer, verified way to travel together.</Typography>
          </Stack>
          <Stack direction="row" gap={1} sx={{ mb: 2.5 }}>
            <Paper elevation={0} sx={{ flex: 1, p: 1.5, borderRadius: 3, bgcolor: "rgba(49,92,214,.06)", border: "1px solid rgba(49,92,214,.12)" }}>
              <VerifiedUserRoundedIcon color="primary" fontSize="small" /><Typography variant="body2" fontWeight={800}>Identity-first safety</Typography>
            </Paper>
            <Paper elevation={0} sx={{ flex: 1, p: 1.5, borderRadius: 3, bgcolor: "rgba(19,160,130,.06)", border: "1px solid rgba(19,160,130,.12)" }}>
              <LockRoundedIcon color="success" fontSize="small" /><Typography variant="body2" fontWeight={800}>Privacy by design</Typography>
            </Paper>
          </Stack>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={submit}>
            <TextField select label="Account type" value={role} onChange={(e) => setRole(e.target.value as "RIDER" | "DRIVER")} sx={{ mb: 2 }}>
              <MenuItem value="RIDER">Rider</MenuItem><MenuItem value="DRIVER">Driver</MenuItem>
            </TextField>
            <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
              <TextField label="First name" value={form.firstName} onChange={set("firstName")} required />
              <TextField label="Last name" value={form.lastName} onChange={set("lastName")} required />
            </Stack>
            <TextField label="Email" type="email" value={form.email} onChange={set("email")} sx={{ mt: 2 }} required />
            <TextField label="Phone" value={form.phone} onChange={set("phone")} sx={{ mt: 2 }} required />
            <TextField label="Password" type="password" value={form.password} onChange={set("password")} sx={{ mt: 2 }} required helperText="Use 10+ characters with upper, lower and number." />
            <TextField label="Confirm password" type="password" value={form.confirm} onChange={set("confirm")} sx={{ mt: 2 }} required />
            <Paper elevation={0} sx={{ mt: 2.5, p: 2, borderRadius: 3, bgcolor: "rgba(49,92,214,.045)", border: "1px solid rgba(49,92,214,.12)" }}>
              <FormControl fullWidth>
                <FormControlLabel control={<Checkbox checked={legalAccepted} onChange={(e) => setLegalAccepted(e.target.checked)} />} label={<Typography variant="body2">I have read and accept the <Link href="/privacy" target="_blank">Privacy Policy</Link> and <Link href="/terms" target="_blank">Terms & Conditions</Link>, including how identity and safety information is handled.</Typography>} />
                <Typography variant="caption" color="text.secondary" sx={{ pl: 4.5 }}>Registration is disabled until this consent is given. Version {LEGAL_VERSION}.</Typography>
              </FormControl>
            </Paper>
            <Button fullWidth variant="contained" size="large" type="submit" disabled={busy || !legalAccepted} sx={{ mt: 2, minHeight: 52 }}>
              {busy ? <><CircularProgress size={22} color="inherit" sx={{ mr: 1.2 }} />Securing your account…</> : "Create account"}
            </Button>
          </Box>
          <Typography sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}>Already registered? <Link href="/login">Sign in</Link></Typography>
        </Paper>
      </Container>
    </Box>
  );
}
