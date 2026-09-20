import type { ThemeOptions } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: { main: "#315CD6", dark: "#2447AE", light: "#6C8BEE", contrastText: "#FFFFFF" },
    secondary: { main: "#16A085", dark: "#0E7B66", light: "#52C7AD" },
    background: { default: "#F5F8FC", paper: "#FFFFFF" },
    text: { primary: "#12213B", secondary: "#64748B" },
    success: { main: "#159A70" },
    warning: { main: "#D98A16" },
    error: { main: "#D6455D" },
    info: { main: "#3E6CE8" },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Segoe UI", Arial, sans-serif',
    h1: { fontWeight: 900, letterSpacing: "-.045em", lineHeight: 1.05 },
    h2: { fontWeight: 900, letterSpacing: "-.038em", lineHeight: 1.08 },
    h3: { fontWeight: 850, letterSpacing: "-.03em", lineHeight: 1.12 },
    h4: { fontWeight: 850, letterSpacing: "-.025em" },
    h5: { fontWeight: 800, letterSpacing: "-.02em" },
    h6: { fontWeight: 800 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.55 },
    button: { fontWeight: 800, textTransform: "none", letterSpacing: "-.01em" },
  },
  shape: { borderRadius: 18 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { overflowX: "hidden" } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 14, minHeight: 44, paddingInline: 18, transition: "transform .22s ease, box-shadow .22s ease, background .22s ease", "&:hover": { transform: "translateY(-2px)" } } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 22, overflow: "hidden" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", overflow: "hidden" } } },
    MuiTextField: { defaultProps: { fullWidth: true, variant: "outlined" } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 14, backgroundColor: "#FFFFFF", "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9CB1E8" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 2 } } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 750, borderRadius: 10 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 14 } } },
    MuiDrawer: { styleOverrides: { paper: { border: 0, boxShadow: "20px 0 60px rgba(18,33,59,.12)" } } },
  },
};
export default themeOptions;
