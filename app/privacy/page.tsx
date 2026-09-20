import Link from "next/link";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";

export default function LegalPage() {
  return (
    <Box sx={{ minHeight: "100vh", py: { xs: 4, md: 8 }, px: 2, background: "#F6F9FD" }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 5 }, borderRadius: 5, border: "1px solid", borderColor: "divider", boxShadow: "0 20px 60px rgba(18,33,59,.08)" }}>
          <Stack direction="row" gap={2} alignItems="center"><ShieldRoundedIcon color="primary" /><Typography variant="h3">Privacy Policy</Typography></Stack>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Effective version: 20 September 2026.</Typography>
          <Typography sx={{ mt: 3, lineHeight: 1.9 }}>ReaGae uses personal, identity and safety information to operate the service, verify accounts, protect riders and drivers, process support and investigate safety incidents. We limit access to authorised personnel and service providers who need the information for these purposes. We do not sell personal information. Information may be disclosed when required by law, to protect people from serious safety threats, to investigate suspected crime or fraud, or as otherwise described in this policy. Identity and biometric verification data is used for the verification purpose for which it was collected and is protected with access controls and encryption appropriate to the service.</Typography>
          <Typography sx={{ mt: 3, lineHeight: 1.9 }}>For production deployment, retention periods, jurisdictions, lawful bases, data-subprocessor details and user rights should be maintained in the complete legal policy and reviewed by qualified legal counsel against applicable South African privacy law.</Typography>
          <Button component={Link} href="/register" variant="contained" sx={{ mt: 3 }}>Back to registration</Button>
        </Paper>
      </Container>
    </Box>
  );
}
