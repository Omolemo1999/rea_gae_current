import Link from "next/link";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";

export default function LegalPage() {
  return (
    <Box sx={{ minHeight: "100vh", py: { xs: 4, md: 8 }, px: 2, background: "#F6F9FD" }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 5 }, borderRadius: 0, border: "1px solid", borderColor: "divider", boxShadow: "0 20px 60px rgba(18,33,59,.08)" }}>
          <Stack direction="row" gap={2} alignItems="center"><ShieldRoundedIcon color="primary" /><Typography variant="h3">Terms & Conditions</Typography></Stack>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Effective version: 20 September 2026.</Typography>
          <Typography sx={{ mt: 3, lineHeight: 1.9 }}>By using ReaGae, you agree to provide accurate account information, protect your login details and use the service lawfully and respectfully. Identity verification is required for safety. Riders must complete a first-time identity verification and a fresh face check each time they request a ride. Drivers must complete the verification steps applicable to their account before publishing rides. ReaGae may restrict, suspend or review accounts where there is suspected fraud, unsafe conduct, abuse of the platform or a legal requirement.</Typography>
          <Typography sx={{ mt: 3, lineHeight: 1.9 }}>For production deployment, retention periods, jurisdictions, lawful bases, data-subprocessor details and user rights should be maintained in the complete legal policy and reviewed by qualified legal counsel against applicable South African privacy law.</Typography>
          <Button component={Link} href="/register" variant="contained" sx={{ mt: 3 }}>Back to registration</Button>
        </Paper>
      </Container>
    </Box>
  );
}
