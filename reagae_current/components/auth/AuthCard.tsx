import { Box, Typography } from "@mui/material";
export default function AuthCard({ title, subtitle, children, eyebrow }: { title: string; subtitle?: string; children: React.ReactNode; eyebrow?: string }) {
  return <Box sx={{ width: "100%", maxWidth: 520 }}>
    {eyebrow && <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: ".12em" }}>{eyebrow}</Typography>}
    <Typography variant="h3" sx={{ mt: .7, fontSize: { xs: "2rem", sm: "2.55rem" } }}>{title}</Typography>
    {subtitle && <Typography sx={{ mt: 1.2, color: "text.secondary", lineHeight: 1.7, maxWidth: 510 }}>{subtitle}</Typography>}
    <Box sx={{ mt: 3 }}>{children}</Box>
  </Box>;
}
