"use client";
import { Alert, Box, Button, Container, Stack, Typography } from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const params = useSearchParams(); const router = useRouter(); const token = params.get("token");
  const [message, setMessage] = useState("Verifying your email…"); const [error, setError] = useState("");
  useEffect(() => { if (!token) { setMessage("Open the verification link from your ReaGae email."); return; } fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(async (r) => { const d = await r.json(); if (!r.ok) { setError(d.error || "Verification failed."); setMessage(""); return; } setMessage(d.message); }).catch(() => { setError("Unable to verify this link."); setMessage(""); }); }, [token]);
  return <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", py: 8 }}><Box sx={{ width: "100%", p: { xs: 3, md: 5 }, border: "1px solid #E5EAF2", borderRadius: 4, bgcolor: "#fff" }}><Typography variant="h3">Email verification</Typography>{message && <Alert severity="success" sx={{ mt: 3 }}>{message}</Alert>}{error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}<Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ mt: 3 }}><Button variant="contained" onClick={() => router.replace("/dashboard")}>Continue</Button><Button variant="outlined" onClick={() => router.replace("/login")}>Sign in</Button></Stack></Box></Container>;
}
