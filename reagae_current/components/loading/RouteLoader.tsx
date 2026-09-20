"use client";
import { useEffect, useState } from "react";
import { Box, LinearProgress } from "@mui/material";
import { usePathname } from "next/navigation";

export default function RouteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  useEffect(() => { setVisible(true); const id = window.setTimeout(() => setVisible(false), 520); return () => window.clearTimeout(id); }, [pathname]);
  if (!visible) return null;
  return <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 2000 }}><LinearProgress sx={{ height: 3, "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg,#315CD6,#16A085,#315CD6)" } }} /></Box>;
}
