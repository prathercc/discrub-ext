import { makeStyles } from "@mui/styles";

const AttachmentStyles = makeStyles(() => ({
  attachmentPreviewBox: {
    position: "relative",
    width: "40px",
    minWidth: "40px",
  },
  attachmentAvatar: {
    position: "absolute !important",
    top: "-20px",
    left: "-5px",
    zIndex: 2,
  },
  attachmentFileIcon: {
    position: "absolute !important",
    top: "-12px",
    left: "5px",
    zIndex: 1,
    color: "#8e9297 !important",
  },
}));

export default AttachmentStyles;
