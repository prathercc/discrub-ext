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

  attachmentImg: {
    width: ({ width }) => (width < 100 ? width : 100),
    height: ({ height }) => (height < 100 ? height : 100),
    transition: "all ease-in-out .5s",
    borderRadius: "5px",
    cursor: "pointer",
    "&:hover": {
      width: ({ width }) => (width > 300 ? 300 : width),
      height: ({ height }) => (height > 300 ? 300 : height),
    },
  },
  altStack: {
    backgroundColor: "rgb(32, 34, 37, 1)",
    padding: "5px",
    borderRadius: "5px",
    minWidth: "181px",
    maxWidth: "400px",
  },
}));

export default AttachmentStyles;
