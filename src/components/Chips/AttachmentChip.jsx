import React from "react";
import {
  textPrimary,
  textSecondary,
  discordPrimary,
} from "../../styleConstants";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";

const AttachmentChip = (props) => {
  return (
    <Chip
      disabled={props.disabled}
      sx={{
        maxWidth: "200px",
        border: `1px solid ${textPrimary}`,
        color: textSecondary,
        backgroundColor: discordPrimary,
        ".MuiChip-deleteIcon": {
          color: textSecondary,
          "&:hover": { color: "rgb(166, 2, 2)" },
        },
      }}
      avatar={
        <Tooltip title="Open">
          <Avatar
            sx={{ cursor: "pointer" }}
            onClick={() => window.open(props.url, "_blank")}
            alt={props.filename}
            src={props.url}
          />
        </Tooltip>
      }
      label={props.filename}
      variant="filled"
      onDelete={props.onDelete}
    />
  );
};
export default AttachmentChip;
