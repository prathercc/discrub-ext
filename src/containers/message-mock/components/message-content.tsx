import { Typography, useTheme } from "@mui/material";

type MessageContentProps = {
  id: string;
  isReply?: boolean;
  rawHtml: string;
};

const MessageContent = ({
  id,
  isReply = false,
  rawHtml,
}: MessageContentProps) => {
  const theme = useTheme();
  return (
    <Typography
      id={id}
      variant={isReply ? "caption" : "body1"}
      sx={{
        display: "block",
        color: isReply
          ? theme.palette.text.disabled
          : theme.palette.text.secondary,
        whiteSpace: isReply ? "nowrap" : "pre-line",
        overflow: isReply ? "hidden" : undefined,
        wordBreak: "break-word",
      }}
      dangerouslySetInnerHTML={{ __html: rawHtml }}
    />
  );
};
export default MessageContent;
