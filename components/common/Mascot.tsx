"use client";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";

export default function Mascot({ message = "Ready when you are!", compact = false }: { message?: string; compact?: boolean }) {
  const [bounce, setBounce] = useState(false);
  useEffect(() => { const id = window.setInterval(() => setBounce(v => !v), 2800); return () => window.clearInterval(id); }, []);
  return <Box sx={{ display: "flex", alignItems: "center", gap: compact ? 1 : 2 }}>
    <Box className={bounce ? "mascot-bounce" : ""} sx={{ width: compact ? 48 : 66, height: compact ? 48 : 66, flexShrink: 0, borderRadius: 0, display: "grid", placeItems: "center", position: "relative", background: "linear-gradient(145deg,#5B6CFF,#8B5CF6)", boxShadow: "0 12px 28px rgba(91,108,255,.28)", color: "#fff", "&:before": { content:'""', position:"absolute", width:10, height:10, borderRadius: 0, background:"#fff", left:"22%", top:"30%", boxShadow:"22px 0 #fff" }, "&:after": { content:'"⌣"', position:"absolute", left:"42%", top:"43%", fontWeight:900, fontSize:18 } }}>
      <DirectionsCarRoundedIcon sx={{ opacity:.25, fontSize: compact ? 25 : 34 }} />
    </Box>
    {!compact && <Box sx={{ p: 1.5, borderRadius: 0, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", boxShadow: "0 8px 24px rgba(24,39,75,.06)" }}><Typography variant="body2" fontWeight={800}>{message}</Typography></Box>}
  </Box>;
}
