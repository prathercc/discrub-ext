import { Typography, useTheme } from "@mui/material";
import Channel from "../../../classes/channel";

type ThreadNameProps = { thread: Channel };

const ThreadName = ({ thread }: ThreadNameProps) => {
  const theme = useTheme();

  return (
    <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
      {thread.name}
    </Typography>
  );
};
export default ThreadName;
