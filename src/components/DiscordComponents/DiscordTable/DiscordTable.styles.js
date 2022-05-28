import { makeStyles } from "@mui/styles";

const DiscordTableStyles = makeStyles(() => ({
  stack: {
    width: "100%",
  },
  icon: {
    color: "rgb(210, 213, 247, 1)",
  },
  tablecell: {
    borderBottom: "1px solid rgba(79,84,92,0.48) !important",
  },
  tablePagination: { color: "rgb(210, 213, 247, 1)", userSelect: "none" },
  box: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: 2,
    backgroundColor: "rgb(47, 49, 54, 1)",
    borderRadius: "6px",
    color: "rgb(88, 101, 242, 1)",
  },
  table: {
    maxWidth: 774,
  },
  tdContent: {
    textAlign: "left",
    verticalAlign: "middle",
    borderBottom: "1px solid rgba(79,84,92,0.48)",
  },
  tdAttachment: {
    textAlign: "center",
    verticalAlign: "middle",
    borderBottom: "1px solid rgba(79,84,92,0.48)",
  },
  gridAvatar: {
    paddingLeft: 2,
  },
  gridMessage: {
    display: "flex",
    alignItems: "center",
    wordBreak: "break-all",
  },
  messageChip: {
    border: "none !important",
    backgroundColor: "transparent !important",
    userSelect: "none",
  },
  typography: {
    userSelect: "none",
  },
  toolbar: {
    minHeight: "116px",
  },
}));

export default DiscordTableStyles;
