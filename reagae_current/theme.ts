import type { ThemeOptions } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: { main: "#315CD6", dark: "#1F43B5", light: "#6D87E9", contrastText: "#FFFFFF" },
    secondary: { main: "#16A085", dark: "#0B765F", light: "#55CDB6", contrastText: "#FFFFFF" },
    background: { default: "#F5F6F8", paper: "#FFFFFF" },
    text: { primary: "#111318", secondary: "#626B78" },
    success: { main: "#168B67" }, warning: { main: "#B7791F" }, error: { main: "#C73B4C" }, info: { main: "#315CD6" },
    divider: "#E3E6EB",
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Manrope", "Segoe UI", Arial, sans-serif',
    h1: { fontWeight: 850, letterSpacing: "-.055em", lineHeight: 1.02 }, h2: { fontWeight: 850, letterSpacing: "-.045em" },
    h3: { fontWeight: 850, letterSpacing: "-.04em", lineHeight: 1.08 }, h4: { fontWeight: 800, letterSpacing: "-.03em" },
    h5: { fontWeight: 800, letterSpacing: "-.025em" }, h6: { fontWeight: 800 }, body1: { lineHeight: 1.6 }, body2: { lineHeight: 1.5 },
    button: { fontWeight: 800, textTransform: "none", letterSpacing: "-.01em" },
  },
  shape: { borderRadius: 0 },
  components: {
    MuiCssBaseline: { styleOverrides: { html: { background: "#F5F6F8" }, body: { overflowX: "hidden", margin: 0 }, "*, *::before, *::after": { boxSizing: "border-box" }, "button, input, textarea, select": { font: "inherit" }, "@keyframes reagaeDrive": { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(calc(100% - 34px))" } }, "@keyframes reagaePulse": { "0%,100%": { opacity: .35, transform: "scale(.96)" }, "50%": { opacity: 1, transform: "scale(1)" } }, ".reagae-car-loader": { animation: "reagaeDrive 1.7s ease-in-out infinite alternate" } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 6, minHeight: 44, paddingInline: 18, transition: "transform .2s ease, box-shadow .2s ease, background .2s ease", "&:hover": { transform: "translateY(-1px)" }, "&.Mui-disabled": { opacity: .62 } } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", overflow: "hidden" } } },
    MuiTextField: { defaultProps: { fullWidth: true, variant: "outlined" } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 0, backgroundColor: "#FFFFFF", "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#9AA8BF" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: 2 } } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 750, borderRadius: 4 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 0, boxShadow: "0 30px 90px rgba(0,0,0,.28)" } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 0, boxShadow: "none" } } },
    MuiDrawer: { styleOverrides: { paper: { border: 0, boxShadow: "18px 0 55px rgba(0,0,0,.14)" } } },
  },
};
export default themeOptions;
