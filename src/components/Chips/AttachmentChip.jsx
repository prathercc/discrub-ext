import React from "react";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import ChipStyles from "./Chip.styles";

const AttachmentChip = (props) => {
  const classes = ChipStyles();
  return (
    <Chip
      {...props}
      avatar={
        <Tooltip title="Open">
          <Avatar
            className={classes.avatar}
            onClick={() => window.open(props.url, "_blank")}
            alt={props.filename}
            src={props.url}
          />
        </Tooltip>
      }
      label={props.filename}
      variant="filled"
    />
  );
};
export default AttachmentChip;
