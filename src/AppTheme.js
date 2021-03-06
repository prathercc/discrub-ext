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
      userSelect: "text",
      cursor: "default",
    },
  },
  components: {
    MuiTablePagination: {
      styleOverrides: {
        selectIcon: {
          color: "rgb(210, 213, 247)",
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        expandIconWrapper: {
          color: "rgb(210, 213, 247)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          " & th": {
            borderBottom: "1px solid rgba(79,84,92,0.48) !important",
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          color: "rgb(210, 213, 247, 1)",
          userSelect: "none",
          "& .MuiFormControlLabel-label.Mui-disabled": {
            color: "rgb(210, 213, 247, 1)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          maxWidth: "200px",
          border: "1px solid rgb(88, 101, 242, 1)",
          backgroundColor: "rgb(32, 34, 37, 1)",
          color: "rgb(210, 213, 247, 1)",
          ".MuiChip-deleteIcon": {
            color: "rgb(210, 213, 247, 1)",
            "&:hover": { color: "rgb(166, 2, 2)" },
          },
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        active: { color: "rgb(210, 213, 247, 1) !important" },
        root: {
          color: "rgb(210, 213, 247, 1) !important",
          "&:hover": {
            color: "rgb(210, 213, 247, 1) !important",
          },
        },
        icon: {
          color: "rgb(210, 213, 247, 1) !important",
        },
        iconDirectionAsc: { color: "rgb(210, 213, 247, 1) !important" },
        iconDirectionDesc: { color: "rgb(210, 213, 247, 1) !important" },
      },
    },
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
          cursor: "pointer",
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
