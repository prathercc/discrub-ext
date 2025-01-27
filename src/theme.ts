import { ThemeOptions, createTheme } from "@mui/material/styles";
import { alpha } from "@mui/material";

const primaryMain = "#7289da";
const primaryDark = "rgb(79, 95, 152)";
const secondaryMain = "#d2d5f7";
const backgroundDefault = "#1e2124";
const backgroundPaper = "#282b30";
const textPrimary = "#ffffff";
const textSecondary = "#d2d5f7";

export const transparancy = {
  backgroundColor: alpha(backgroundPaper, 0.5),
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)", // For Safari support,
};

const toolTipStyle = {
  padding: "7px",
  ...transparancy,
  fontWeight: 600,
  fontSize: "0.8rem",
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
          color: alpha(backgroundPaper, 0.5),
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          cursor: "default",
        },
      },
    },
  },
});

export const scrollbarOverrides = {
  "scrollbar-height": "5px",
  "scrollbar-width": "5px",
  "scrollbar-thumb": { background: "#f1f1f1" },
  "scrollbar-track": { background: "#888" },
  "&::-webkit-scrollbar": {
    width: "5px",
    height: "5px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#f1f1f1",
  },
  "&::-webkit-scrollbar-track": {
    background: "#888",
  },
};

export const audioOverrides = {
  "audio::-webkit-media-controls-panel": {
    backgroundColor: backgroundPaper,
    borderRadius: 0,
  },
  "audio::-webkit-media-controls-enclosure": {
    backgroundColor: backgroundPaper,
  },
  "audio::-webkit-media-controls-mute-button": {
    backgroundColor: secondaryMain,
    borderRadius: "50%",
  },
  "audio::-webkit-media-controls-play-button ": {
    backgroundColor: primaryMain,
    borderRadius: "50%",
  },
  "audio::-webkit-media-controls-play-button:hover": {
    backgroundColor: primaryDark,
  },
  "audio::-webkit-media-controls-current-time-display": {
    color: secondaryMain,
    textShadow: "none",
  },
  "audio::-webkit-media-controls-time-remaining-display": {
    color: secondaryMain,
    textShadow: "none",
  },
  "audio::-webkit-media-controls-timeline": {
    backgroundColor: secondaryMain,
    borderRadius: "25px",
    marginLeft: "10px",
    marginRight: "10px",
  },
  "audio::-webkit-media-controls-volume-slider ": {
    backgroundColor: secondaryMain,
    borderRadius: "25px",
    paddingLeft: "8px",
    paddingRight: "8px",
  },
};
