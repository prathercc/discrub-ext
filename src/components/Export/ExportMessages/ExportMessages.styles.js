import { makeStyles } from "@mui/styles";

const ExportMessagesStyles = makeStyles(() => ({
  boxContainer: {
    display: "none",
    margin: 0,
  },
  typographyTitle: {
    color: "#fff !important",
  },
  typographyHash: {
    color: "#8e9297 !important",
  },
  typographyMessageText: {
    color: "#DCDDDE !important",
  },
  exportTitleStack: {
    width: "100%",
    zIndex: 5000,
    borderBottom: "0.5px solid #202225",
    padding: "5px",
    position: "fixed",
    top: 0,
    backgroundColor: "#36393f",
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
  messagesStack: {
    marginTop: "55px",
    width: "100%",
  },
  messageMockMainStack: {
    maxWidth: "100vw",
    wordBreak: "break-all",
    minHeight: "50px",
  },
  messageAttachmentStack: {
    backgroundColor: "#2f3136",
    borderRadius: "5px",
    border: "1px solid #292b2f",
    minWidth: "fit-content",
    width: "fit-content",
  },
  messageAttachmentSize: {
    color: "#4F545C !important",
  },
  avatarBox: {
    position: "relative",
    width: ({ reply }) => (reply ? "15px !important" : "40px"),
    height: ({ reply }) => (reply ? "15px !important" : "40px"),
    minWidth: ({ reply }) => (reply ? "15px !important" : "40px"),
  },
  avatarMain: {
    position: "absolute !important",
    width: ({ reply }) => (reply ? "15px !important" : "40px"),
    height: ({ reply }) => (reply ? "15px !important" : "40px"),
    minWidth: ({ reply }) => (reply ? "15px !important" : "40px"),
    boxShadow: ({ reply }) => !reply && "rgba(0, 0, 0, 0.75) 5px 4px 1px -2px",
    "&:hover": {
      boxShadow: ({ reply, hideAttachments }) =>
        !reply && hideAttachments && "rgba(0, 0, 0, 0.75) 5px 4px 1px 1px",
      width: ({ reply, hideAttachments }) =>
        !reply && hideAttachments && "42px",
      height: ({ reply, hideAttachments }) =>
        !reply && hideAttachments && "42px",
      cursor: ({ reply, hideAttachments }) =>
        !reply && hideAttachments && "pointer",
    },
  },
  replyMessageText: {
    color: "#b8b9bf !important",
    overflow: "hidden",
    whiteSpace: "nowrap",
    "& a": {
      color: "inherit",
      textDecoration: "inherit",
    },
  },
  replyMessageName: {
    color: "#a0a1a4 !important",
    whiteSpace: "nowrap",
  },
  replyDiv: {
    marginLeft: 20,
    marginTop: 8,
    height: 7,
    width: 25,
    borderLeft: "2px solid #4e5058",
    borderTop: "2px solid #4e5058",
    borderTopLeftRadius: "5px",
  },
  mockStack: {
    "&:target": {
      background: "rgb(92, 107, 192, 0.25)",
      padding: "5px",
      width: "calc(100% - 10px)",
    },
  },
}));

export default ExportMessagesStyles;
