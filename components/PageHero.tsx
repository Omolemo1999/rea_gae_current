import { Box, Container, Typography } from "@mui/material";

export default function PageHero({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <Box sx={{ pt: { xs: 12, md: 15 }, pb: 5, background: "linear-gradient(180deg,#eef3ff 0%,#f6f8fc 100%)" }}>
      <Container maxWidth="xl">
        {eyebrow && <Typography sx={{ color: "primary.main", fontWeight: 850, mb: 1 }}>{eyebrow}</Typography>}
        <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "3.2rem" }, maxWidth: 850 }}>{title}</Typography>
        {description && <Typography sx={{ mt: 1.5, color: "text.secondary", maxWidth: 720, fontSize: "1.05rem", lineHeight: 1.7 }}>{description}</Typography>}
      </Container>
    </Box>
  );
}
