import { makeStyles } from "@mui/styles";

const InjectedDialogStyles = makeStyles(() => ({
  boxContainer: {
    backgroundColor: "rgb(32, 34, 37, 1)",
    height: "720px",
    maxHeight: "720px",
    maxWidth: "775px",
    width: "775px",
    color: "rgb(210, 213, 247, 1)",
    padding: 0,
    margin: 0,
    border: "1px solid rgb(210, 213, 247, 0.2)",
    wordWrap: "break-word",
    overflow: "hidden",
    borderRadius: "1px",
    boxShadow: "17px 18px 5px -9px rgba(0,0,0,0.41)",
  },
  box: {
    position: "fixed",
    top: "16px",
    right: "295px",
    opacity: 0.35,
  },
  alertBox: {
    position: "fixed",
    bottom: "74px",
    left: "242px",
    width: "767px",
  },
  logo: {
    width: "24px",
    height: "24px",
    margin: "auto",
  },
}));

export default InjectedDialogStyles;
