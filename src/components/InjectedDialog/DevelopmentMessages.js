import React from "react";
import Box from "@mui/material/Box";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";

const DevelopmentMessages = () => {
  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: "0px",
          left: "5px",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      >
        <DiscordTypography>Discrub</DiscordTypography>
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: "0px",
          right: "5px",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      >
        <DiscordTypography>Version 1.0.4</DiscordTypography>
      </Box>
    </>
  );
};

export default DevelopmentMessages;
