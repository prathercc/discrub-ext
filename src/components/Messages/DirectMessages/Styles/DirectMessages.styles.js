import { makeStyles } from "@mui/styles";

const DirectMessagesStyles = makeStyles(() => ({
  boxContainer: {
    padding: "15px",
    maxHeight: "85%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  box: {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    marginTop: "1vh",
    flexDirection: "column",
  },
  tableBox: {
    maxHeight: ({ showOptionalFilters }) =>
      `calc(360px - ${showOptionalFilters ? "50px" : "0px"})`,
    overflow: "auto",
  },
  paper: {
    padding: "10px",
  },
  dmField: {
    width: "670px !important",
  },
}));

export default DirectMessagesStyles;
