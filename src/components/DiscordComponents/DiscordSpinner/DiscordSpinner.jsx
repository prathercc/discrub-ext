import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

function DiscordSpinner() {
  return (
    <Box sx={{ display: "flex" }}>
      <CircularProgress sx={{ color: "rgb(88, 101, 242)", mx: "auto" }} />
    </Box>
  );
}

export default DiscordSpinner;
