import { makeStyles } from "@mui/styles";

const DiscrubDialogStyles = makeStyles(() => ({
  boxContainer: {
    backgroundColor: "#2b2d31",
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
    top: "23px",
    right: "310px",
    opacity: 0.25,
  },
  alertBox: {
    position: "fixed",
    bottom: "54px",
    left: "268px",
    width: "714px",
  },
  logo: {
    width: "24px",
    height: "24px",
    margin: "auto",
  },
  alertText: {
    userSelect: "none !important",
  },
}));

export default DiscrubDialogStyles;
