import React from "react";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";

const MessageChip = (props) => {
  return (
    <Chip
      {...props}
      avatar={
        <Tooltip arrow title={props.username}>
          <Avatar alt={props.username} src={props.avatar} />
        </Tooltip>
      }
      label={props.content}
      variant="filled"
    />
  );
};
export default MessageChip;
