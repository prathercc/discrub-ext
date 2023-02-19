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
  },
}));

export default AttachmentStyles;
