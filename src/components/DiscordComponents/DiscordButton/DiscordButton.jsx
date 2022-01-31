/*global chrome*/
import * as React from "react";
import Button from "@mui/material/Button";
import {
  textSecondary,
  textPrimary,
  discordPrimary,
} from "../../../styleConstants";

function DiscordButton({ icon, label, onClick, neutral = false, ...props }) {
  return (
    <Button
      {...props}
      sx={{
        "&:hover": {
          backgroundColor: neutral ? textSecondary : textPrimary,
        },
        backgroundColor: neutral ? textSecondary : textPrimary,
        textTransform: "none",
        fontFamily: 'Whitney,"Helvetica Neue",Helvetica,Arial,sans-serif',
        fontWeight: 500,
        color: neutral ? discordPrimary : textSecondary,
        ...props.sx,
      }}
      style={{ width: "90px", height: "30px" }}
      startIcon={icon}
      variant="contained"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export default DiscordButton;
