import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

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
        <Typography>Discrub</Typography>
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
        <Typography>Version 1.0.4</Typography>
      </Box>
    </>
  );
};

export default DevelopmentMessages;
