"use client";

import { ReactNode, useMemo } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import themeOptions from "@/theme";

interface ThemeRegistryProps { children: ReactNode; }

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  const theme = useMemo(() => createTheme(themeOptions), []);
  return <ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider>;
}
