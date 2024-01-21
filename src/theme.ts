import { ThemeOptions, createTheme } from "@mui/material/styles";

const primaryMain = "#7289da";
const primaryDark = "rgb(79, 95, 152)";
const secondaryMain = "#d2d5f7";
const backgroundDefault = "#1e2124";
const backgroundPaper = "#282b30";
const textPrimary = "#ffffff";
const textSecondary = "#d2d5f7";

const toolTipStyle = {
  padding: "7px",
  background: primaryDark,
  fontWeight: 600,
  fontSize: "0.8rem",
  boxShadow: "4px 2px 5px 1px rgb(0 0 0 / 41%)",
};

export const theme: ThemeOptions = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: primaryMain,
    },
    secondary: {
      main: secondaryMain,
    },
    background: {
      default: backgroundDefault,
      paper: backgroundPaper,
    },
    text: {
      primary: textPrimary,
      secondary: textSecondary,
    },
    error: {
      main: "#fa777c",
    },
    warning: {
      main: "#faa61a",
    },
    info: {
      main: "#7289da",
    },
    success: {
      main: "#3ba55c",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltipPlacementBottom: toolTipStyle,
        tooltipPlacementTop: toolTipStyle,
        tooltipPlacementLeft: toolTipStyle,
        tooltipPlacementRight: toolTipStyle,
        tooltipArrow: toolTipStyle,
        arrow: {
          color: primaryMain,
        },
      },
    },
  },
});
