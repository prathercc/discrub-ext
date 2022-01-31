import React from "react";
import DialogContent from "@mui/material/DialogContent";
import { textSecondary, discordPrimary } from "../../../styleConstants";
import { Box } from "@mui/material";

const DiscordDialogContent = (props) => {
  return (
    <DialogContent
      {...props}
      sx={{
        color: textSecondary,
        backgroundColor: discordPrimary,
        border: `1px solid ${textSecondary.slice(0, 18) + "0.2)"}`,
        borderBottom: "none",
        borderTop: "none",
        ...props.sx,
      }}
    >
      <Box sx={{ marginTop: "10px" }}>{props.children}</Box>
    </DialogContent>
  );
};
export default DiscordDialogContent;
