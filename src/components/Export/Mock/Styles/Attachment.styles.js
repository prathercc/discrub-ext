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
    boxShadow: "4px 5px 6px 0px rgba(0,0,0,0.75)",
    "&:hover": {
      width: ({ width, maxWidth = 400 }) =>
        width > maxWidth ? maxWidth : width,
      height: ({ height, maxHeight = 400 }) =>
        height > maxHeight ? maxHeight : height,
    },
  },
  altStack: {
    backgroundColor: "#2b2d31",
    padding: "5px",
    borderRadius: "5px",
    minWidth: "181px",
    maxWidth: "400px",
  },
  video: {
    borderRadius: "10px",
    border: "1px solid transparent",
    boxShadow: "4px 5px 13px 0px rgba(0,0,0,0.75)",
  },
}));

export default AttachmentStyles;
