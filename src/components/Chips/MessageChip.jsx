import React from "react";
import {
  textPrimary,
  textSecondary,
  discordPrimary,
} from "../../styleConstants";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";

const MessageChip = (props) => {
  return (
    <Chip
      disabled={props.disabled}
      sx={{
        maxWidth: "200px",
        border: `1px solid ${textPrimary}`,
        backgroundColor: discordPrimary,
        color: textSecondary,
        ".MuiChip-deleteIcon": {
          color: textSecondary,
          "&:hover": { color: "rgb(166, 2, 2)" },
        },
        ...props.sx,
      }}
      avatar={
        <Tooltip title={props.username}>
          <Avatar alt={props.username} src={props.avatar} />
        </Tooltip>
      }
      label={props.content}
      variant="filled"
    />
  );
};
export default MessageChip;
