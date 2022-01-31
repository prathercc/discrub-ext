import React from "react";
import Paper from "@mui/material/Paper";
import { discordSecondary } from "../../../styleConstants";

function DiscordPaper(props) {
  return (
    <Paper
      {...props}
      sx={{
        backgroundColor: discordSecondary,
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "10px",
        ...props.sx,
      }}
      elevation={2}
    >
      {props.children}
    </Paper>
  );
}

export default DiscordPaper;
