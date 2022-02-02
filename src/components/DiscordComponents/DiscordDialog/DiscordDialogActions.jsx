import React from "react";
import DialogActions from "@mui/material/DialogActions";
import { textSecondary, discordPrimary } from "../../../styleConstants";

const DiscordDialogActions = (props) => {
  return (
    <DialogActions
      {...props}
      sx={{
        backgroundColor: discordPrimary,
        border: `1px solid ${textSecondary.slice(0, 18) + "0.2)"}`,
        borderTop: "none",
        ...props.sx,
      }}
    >
      {props.children}
    </DialogActions>
  );
};
export default DiscordDialogActions;
