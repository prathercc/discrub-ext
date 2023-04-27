import { makeStyles } from "@mui/styles";

const InjectedDialogStyles = makeStyles(() => ({
  boxContainer: {
    backgroundColor: "rgb(32, 34, 37, 1)",
    height: "615px",
    maxHeight: "615px",
    maxWidth: "720px",
    width: "720px",
    color: "rgb(210, 213, 247, 1)",
    padding: 0,
    margin: 0,
    border: "1px solid rgb(210, 213, 247, 0.2)",
    wordWrap: "break-word",
    overflow: "hidden",
    borderRadius: "6px",
    boxShadow: "10px 11px 7px -1px rgba(0,0,0,0.41)",
  },
  box: {
    position: "fixed",
    top: "16px",
    right: "311px",
    opacity: 0.35,
  },
  alertBox: {
    position: "fixed",
    bottom: "54px",
    left: "268px",
    width: "714px",
    "& .MuiAlert-root": {
      backgroundColor: "#2f3136 !important",
      color: "#d2d5f7 !important",
    },
    "& .MuiAlert-icon": {
      color: "#5865f2 !important",
    },
    "& .MuiTypography-root": {
      color: "#d2d5f7 !important",
    },
  },
  logo: {
    width: "24px",
    height: "24px",
    margin: "auto",
  },
}));

export default InjectedDialogStyles;
