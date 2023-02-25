import { makeStyles } from "@mui/styles";

const InjectedDialogStyles = makeStyles(() => ({
  boxContainer: {
    backgroundColor: "rgb(32, 34, 37, 1)",
    height: "660px",
    maxHeight: "660px",
    maxWidth: "775px",
    width: "775px",
    color: "rgb(210, 213, 247, 1)",
    padding: 0,
    margin: 0,
    border: "1px solid rgb(210, 213, 247, 0.2)",
    wordWrap: "break-word",
    overflow: "hidden",
    borderRadius: "1px",
  },
  box: {
    position: "fixed",
    top: "10px",
    right: "55px",
    opacity: 0.25,
  },
  alertBox: {
    position: "fixed",
    bottom: "5px",
    left: "5px",
    width: "767px",
  },
  logo: {
    width: "24px",
    height: "24px",
    margin: "auto",
  },
}));

export default InjectedDialogStyles;
