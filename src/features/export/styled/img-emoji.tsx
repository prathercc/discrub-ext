import { styled } from "@mui/system";

const ImgEmoji = styled("img", {
  shouldForwardProp: (prop) => prop !== "isReply",
})<{ isReply: boolean }>(({ isReply }) => ({
  display: "inline-flex",
  verticalAlign: "middle",
  width: isReply ? "16px" : "25px",
  height: isReply ? "16px" : "25px",
}));

export default ImgEmoji;
