import { makeStyles } from "@mui/styles";

const ExportButtonGroupStyles = makeStyles(() => ({
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
    width: "40px",
    minWidth: "40px",
  },
  avatarMain: {
    position: "absolute !important",
  },
}));

export default ExportButtonGroupStyles;
