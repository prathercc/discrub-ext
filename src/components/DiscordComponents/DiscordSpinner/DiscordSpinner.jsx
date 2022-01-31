import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { textPrimary } from "../../../styleConstants";

function DiscordSpinner() {
  return (
    <Box sx={{ display: "flex" }}>
      <CircularProgress sx={{ color: textPrimary, mx: "auto" }} />
    </Box>
  );
}

export default DiscordSpinner;
