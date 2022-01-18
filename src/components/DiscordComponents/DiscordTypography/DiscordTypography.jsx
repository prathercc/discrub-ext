import React from "react";
import { Typography } from "@mui/material";

function DiscordTypography(props) {
  return (
    <Typography sx={{ color: "rgb(210, 213, 247)", ...props.sx }} {...props}>
      {props.children}
    </Typography>
  );
}

export default DiscordTypography;
