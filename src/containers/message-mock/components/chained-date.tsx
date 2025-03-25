import { Box, Typography, useTheme } from "@mui/material";
import { format, parseISO } from "date-fns";
import Message from "../../../classes/message";

type ChainedDateProps = {
  message: Message;
  longDateTime: string;
  timeFormat: string;
};

const ChainedDate = ({
  message,
  longDateTime,
  timeFormat,
}: ChainedDateProps) => {
  const theme = useTheme();
  const messageDate = parseISO(message.timestamp);
  const shortTime = format(messageDate, timeFormat);

  return (
    <Box
      title={longDateTime}
      sx={{
        width: "fit-content",
        height: "20px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Typography
        id={`chained-message-${message.id}`}
        sx={{
          fontSize: "10px !important",
          color: theme.palette.text.disabled,
          opacity: 0,
        }}
        variant="caption"
      >
        {shortTime}
      </Typography>
    </Box>
  );
};
export default ChainedDate;
