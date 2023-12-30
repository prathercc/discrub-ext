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
  skipRepliesParent: {
    backgroundColor: "rgb(32, 34, 37, 0.25)",
    borderRadius: "15px",
    padding: "8px",
  },
}));

export default TagsStyles;
