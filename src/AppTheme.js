import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      light: "rgb(88, 101, 242)",
      main: "rgb(88, 101, 242)",
      dark: "rgb(88, 101, 242)",
      contrastText: "rgb(210, 213, 247)",
    },
    secondary: {
      light: "rgb(210, 213, 247)",
      main: "rgb(210, 213, 247)",
      dark: "rgb(210, 213, 247)",
      contrastText: "rgb(32, 34, 37)",
    },
    background: { paper: "rgb(47, 49, 54)", default: "rgb(32, 34, 37)" },
    text: {
      primary: "rgb(210, 213, 247)",
      disabled: "rgb(210, 213, 247, 0.5)",
    },
  },
  typography: {
    fontFamily: ["Ubuntu", "sans-serif"].join(","),
    allVariants: {
      color: "rgb(210, 213, 247)",
      userSelect: "none",
      cursor: "default",
    },
  },
  components: {
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "rgb(210, 213, 247)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          width: "auto",
          height: "30px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiSvgIcon-root": { color: "rgb(210, 213, 247)" },
          "& .Mui-disabled svg": {
            color: "rgb(210, 213, 247, 0.5) !important",
          },
        },
      },
    },
  },
});

export const AppTheme = (props) => {
  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
};

export default AppTheme;
