import Avatar from "@mui/material/Avatar";
import Chip, { ChipProps } from "@mui/material/Chip";
import Tooltip from "../common-components/tooltip/tooltip";

const MessageChip = (
  props: ChipProps & { username: string; avatarSrc: string; content: string }
) => {
  return (
    <Chip
      {...props}
      avatar={
        <Tooltip arrow title={props.username}>
          <Avatar alt={props.username} src={props.avatarSrc} />
        </Tooltip>
      }
      label={props.content}
      variant="filled"
    />
  );
};
export default MessageChip;
