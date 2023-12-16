import { makeStyles } from "@mui/styles";

const MessageTitleMockStyles = makeStyles(() => ({
  exportTitleStack: {
    width: "100%",
    zIndex: 5000,
    borderBottom: "0.5px solid #202225",
    padding: "5px",
    position: "fixed",
    top: 0,
    backgroundColor: "#313338",
    "& h4": {
      userSelect: "none !important",
      cursor: "default !important",
    },
    "& h6": {
      userSelect: "none !important",
      cursor: "default !important",
    },
  },
  poweredByStack: {
    borderRadius: "5px",
    padding: "5px",
    userSelect: "none !important",
    cursor: "default !important",
    "& span": {
      userSelect: "none !important",
      cursor: "default !important",
    },
  },
}));

export default MessageTitleMockStyles;
