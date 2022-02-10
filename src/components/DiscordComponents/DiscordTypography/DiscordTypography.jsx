import React, { forwardRef } from "react";
import { Typography } from "@mui/material";
import { textSecondary } from "../../../styleConstants";

const DiscordTypography = forwardRef((props, ref) => {
  return (
    <Typography
      ref={ref}
      {...props}
      sx={{ color: textSecondary, userSelect: "none", ...props.sx }}
    >
      {props.children}
    </Typography>
  );
});

export default DiscordTypography;
