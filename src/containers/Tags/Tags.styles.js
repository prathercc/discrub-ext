import { makeStyles } from "@mui/styles";

const TagsStyles = makeStyles(() => ({
  autocomplete: {
    width: "330px !important",
  },
  container: {
    padding: "15px",
    maxHeight: "85%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  paper: {
    padding: "10px",
    margin: "10px 10px 0px 10px",
  },
  progressBox: {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    marginTop: "1vh",
    flexDirection: "column",
  },
}));

export default TagsStyles;
