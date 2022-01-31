import React from "react";
import { Typography } from "@mui/material";
import { textSecondary } from "../../../styleConstants";

function DiscordTypography(props) {
  return (
    <Typography
      {...props}
      sx={{ color: textSecondary, userSelect: "none", ...props.sx }}
    >
      {props.children}
    </Typography>
  );
}

export default DiscordTypography;
