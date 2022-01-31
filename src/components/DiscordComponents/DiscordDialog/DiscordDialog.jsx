import React from "react";
import Dialog from "@mui/material/Dialog";

const DiscordDialog = (props) => {
  return (
    <Dialog
      {...props}
      sx={{
        backgroundColor: "transparent",
        ...props.sx,
      }}
      fullWidth={true}
      maxWidth="md"
    >
      {props.children}
    </Dialog>
  );
};
export default DiscordDialog;
