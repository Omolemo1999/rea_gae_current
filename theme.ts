import type { ThemeOptions } from "@mui/material/styles";
const themeOptions: ThemeOptions = {
 palette:{mode:"light",primary:{main:"#5B6CFF",dark:"#4051D8",contrastText:"#fff"},secondary:{main:"#8B5CF6"},background:{default:"#F4F6FF",paper:"#FFFFFF"},text:{primary:"#17213D",secondary:"#66718A"},success:{main:"#18A66A"},warning:{main:"#F0A62B"},error:{main:"#E45555"},divider:"#E4E8F3"},
 typography:{fontFamily:"Inter, Arial, sans-serif",h1:{fontWeight:900,letterSpacing:"-.04em"},h2:{fontWeight:900,letterSpacing:"-.03em"},h3:{fontWeight:850,letterSpacing:"-.025em"},h4:{fontWeight:850},h5:{fontWeight:800},button:{fontWeight:800,textTransform:"none"}},
 shape:{borderRadius:18},
 components:{MuiButton:{defaultProps:{disableElevation:true},styleOverrides:{root:{borderRadius:14,paddingInline:18,minHeight:44,"&:hover":{transform:"translateY(-2px)"},transition:"transform .18s ease"}}},MuiCard:{styleOverrides:{root:{borderRadius:22}}},MuiPaper:{styleOverrides:{root:{backgroundImage:"none"}}},MuiTextField:{defaultProps:{fullWidth:true}},MuiChip:{styleOverrides:{root:{fontWeight:750}}}}
};
export default themeOptions;
