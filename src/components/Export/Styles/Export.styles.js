import { makeStyles } from "@mui/styles";

const ExportStyles = makeStyles(() => ({
  boxContainer: {
    display: "none",
    margin: 0,
  },
  authorNameParent: {
    display: "flex",
    gap: "5px",
    "& a": {
      display: "flex",
      gap: "5px",
    },
  },
  typographyTitle: {
    color: "#fff !important",
  },
  channelName: {
    textDecoration: "underline",
    textDecorationStyle: "dotted",
  },
  typographyHash: {
    color: "#8e9297 !important",
  },
  botTag: {
    color: "#FFF !important",
    backgroundColor: "#5865f2",
    borderRadius: "5px",
    display: "inline-flex",
    fontSize: "10px",
    alignItems: "center",
    justifyContent: "center",
    height: "16px",
    width: "38px",
    gap: "2px",
    wordBreak: "keep-all",
    "& svg": {
      width: "12px !important",
    },
  },
  typographyMessageText: {
    color: "#DCDDDE !important",
    whiteSpace: "pre-line",
  },
  messagesStack: {
    marginTop: "55px",
    width: "100%",
  },
  messageMockMainStack: {
    paddingLeft: ({ browserView }) => !browserView && "8px",
    maxWidth: "100vw",
    wordBreak: "break-all",
    minHeight: ({ isChained }) => (isChained ? 0 : "50px"),
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
    transition: "all ease-in-out .1s",
    "&:hover": {
      boxShadow: ({ reply, browserView }) =>
        !reply && browserView && "rgba(0, 0, 0, 0.75) 5px 4px 1px 1px",
      width: ({ reply, browserView }) => !reply && browserView && "42px",
      height: ({ reply, browserView }) => !reply && browserView && "42px",
      cursor: ({ reply, browserView }) => !reply && browserView && "pointer",
    },
  },
  replyMessageText: {
    color: "#b8b9bf !important",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  replyMessageName: {
    color: "#a0a1a4 !important",
    whiteSpace: "nowrap",
    "& a": {
      color: "inherit",
      textDecoration: "inherit",
    },
  },
  replyDiv: {
    marginLeft: 20,
    marginTop: 8,
    height: 7,
    width: 17,
    borderLeft: "2px solid #4e5058",
    borderTop: "2px solid #4e5058",
    borderTopLeftRadius: "5px",
  },
  mockStack: {
    width: "calc(100% - 10px)",
    "&:hover": {
      backgroundColor: ({ browserView }) => !browserView && "#2e2f35",
      "& span": { opacity: "1 !important" },
    },
    margin: ({ isChained }) => isChained && "0px 0px 0px !important",
    "&:target": {
      background: "rgb(92, 107, 192, 0.25)",
      padding: "5px",
      width: "calc(100% - 10px)",
    },
  },
  messageContent: {
    display: "block",
  },
  roleIconImg: {
    width: "20px",
    height: "20px",
  },
  channelDescription: {
    maxWidth: "200px",
    maxHeight: "40px",
    overflowY: "auto",
    overflowX: "hidden",
    color: "rgb(142, 146, 151) !important",
    whiteSpace: "pre-line",
    padding: "0px 5px 0px 5px",
  },
  chainedDateParent: {
    width: "40px",
    height: "20px",
    display: "flex",
    alignItems: "center",
  },
  chainedDate: {
    fontSize: "10px !important",
    color: "rgb(142, 146, 151) !important",
    opacity: 0,
  },
}));

export default ExportStyles;
