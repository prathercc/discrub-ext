import { makeStyles } from "@mui/styles";

const ChannelMessagesStyles = makeStyles(() => ({
  boxContainer: {
    padding: "15px",
    maxHeight: "85%",
    maxWidth: "100%",
    overflow: "auto",
  },
  box: {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    marginTop: "1vh",
  },
  tableBox: {
    maxHeight: "350px",
    overflow: "auto",
  },
  paper: {
    padding: "10px",
  },
  objIdTypography: {
    display: "block",
  },
  purgeHidden: {
    opacity: ({ purgeDialogOpen, exportDialogOpen }) =>
      (purgeDialogOpen || exportDialogOpen) && 0,
  },
  purgeWarning: {
    color: "#f44336",
  },
}));

export default ChannelMessagesStyles;
