import { makeStyles } from "@mui/styles";

const DirectMessagesStyles = makeStyles(() => ({
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
    maxHeight: "460px",
    overflow: "auto",
    "&::-webkit-scrollbar": {
      width: "5px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#f1f1f1",
    },
    "&::-webkit-scrollbar-track": {
      background: "#888",
    },
  },
  paper: {
    padding: "10px",
  },
}));

export default DirectMessagesStyles;
