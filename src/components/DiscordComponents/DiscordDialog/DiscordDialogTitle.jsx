import React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import { textSecondary, discordSecondary } from "../../../styleConstants";

const DiscordDialogTitle = (props) => {
  return (
    <DialogTitle
      {...props}
      sx={{
        backgroundColor: discordSecondary,
        border: `1px solid ${textSecondary.slice(0, 18) + "0.2)"}`,
        borderBottom: "none",
        padding: "8px 16px",
        userSelect: "none",
        ...props.sx,
      }}
    >
      {props.children}
    </DialogTitle>
  );
};
export default DiscordDialogTitle;
