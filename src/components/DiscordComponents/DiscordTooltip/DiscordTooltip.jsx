import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";

const DiscordTooltip = (props) => {
  const { title, description } = props;
  return (
    <Tooltip
      {...props}
      title={
        <Box>
          <div>{title}</div>
          {description && (
            <Typography mt={0.5} variant="caption">
              {description}
            </Typography>
          )}
        </Box>
      }
    >
      {props.children}
    </Tooltip>
  );
};

export default DiscordTooltip;
