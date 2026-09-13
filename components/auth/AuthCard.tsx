import { Box, Paper, Typography } from "@mui/material";

export default function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ width: "100%", maxWidth: 480, p: { xs: 3, sm: 4 }, border: "1px solid #E5EAF2", borderRadius: 4 }}>
      <Typography variant="h4" sx={{ fontSize: "1.8rem" }}>{title}</Typography>
      {subtitle && <Typography sx={{ mt: 1, color: "text.secondary", lineHeight: 1.6 }}>{subtitle}</Typography>}
      <Box sx={{ mt: 3 }}>{children}</Box>
    </Paper>
  );
}
