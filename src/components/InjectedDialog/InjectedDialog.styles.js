import { makeStyles } from "@mui/styles";

const InjectedDialogStyles = makeStyles(() => ({
  boxContainer: {
    backgroundColor: "rgb(32, 34, 37, 1)",
    height: "700px",
    maxHeight: "700px",
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
    bottom: "4px",
    right: "5px",
  },
}));

export default InjectedDialogStyles;
