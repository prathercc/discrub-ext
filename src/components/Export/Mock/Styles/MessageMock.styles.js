import { makeStyles } from "@mui/styles";

const MessageMockStyles = makeStyles(() => ({
  emojiBox: {
    display: "inline-flex",
    position: "relative",
    "& span": { opacity: 0 },
    "&:hover": { "& span": { opacity: 1 } },
  },
  emojiImgDefault: {
    width: "25px",
    height: "25px",
  },
  emojiImgSmall: {
    width: "16px",
    height: "16px",
  },
  emojiTooltip: {
    backgroundColor: "#18191c",
    position: "absolute",
    top: "-15px",
    left: "-15px",
    width: "max-content",
    fontSize: "0.65rem",
    borderRadius: "5px",
    color: "rgb(220, 221, 222) !important",
  },
}));

export default MessageMockStyles;
