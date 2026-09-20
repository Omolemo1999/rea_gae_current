"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import DirectionsCarFilledRoundedIcon from "@mui/icons-material/DirectionsCarFilledRounded";

export default function CarLoader({ label = "Loading your journey…", fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <Box sx={{
      minHeight: fullScreen ? "100vh" : 150,
      width: "100%", display: "grid", placeItems: "center", overflow: "hidden",
      bgcolor: fullScreen ? "#F5F6F8" : "transparent", px: 2,
    }} aria-live="polite" aria-busy="true">
      <Box sx={{ width: "min(360px,100%)", textAlign: "center" }}>
        <Box sx={{ position: "relative", height: 54, mb: 1.5 }}>
          <Box sx={{ position: "absolute", left: 10, right: 10, bottom: 9, height: 2, bgcolor: "#D8DDE5" }} />
          <Box sx={{ position: "absolute", left: 10, right: 10, bottom: 4, display: "flex", justifyContent: "space-between", color: "#A9B0BB" }}>
            <Box sx={{ width: 5, height: 5, bgcolor: "currentColor", borderRadius: 0 }} />
            <Box sx={{ width: 5, height: 5, bgcolor: "currentColor", borderRadius: 0 }} />
            <Box sx={{ width: 5, height: 5, bgcolor: "currentColor", borderRadius: 0 }} />
          </Box>
          <Box className="reagae-car-loader" sx={{ position: "absolute", left: 0, bottom: 5, color: "#315CD6", display: "flex", alignItems: "center" }}>
            <DirectionsCarFilledRoundedIcon sx={{ fontSize: 34 }} />
          </Box>
        </Box>
        <CircularProgress size={22} thickness={4} sx={{ color: "#315CD6" }} />
        <Typography variant="body2" sx={{ mt: 1, fontWeight: 750, color: "#596273" }}>{label}</Typography>
      </Box>
    </Box>
  );
}
