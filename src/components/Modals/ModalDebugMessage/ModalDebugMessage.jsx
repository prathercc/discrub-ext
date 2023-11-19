import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

const ModalDebugMessage = ({ debugMessage }) => {
  return (
    <Box
      my={1}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        opacity: debugMessage?.length === 0 ? 0 : 1,
      }}
    >
      <Typography variant="caption" sx={{ color: "orange" }}>
        {debugMessage?.length === 0 ? "An Error Occurred!" : debugMessage}
      </Typography>
    </Box>
  );
};
export default ModalDebugMessage;
