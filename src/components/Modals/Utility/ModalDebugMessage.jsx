import React from "react";
import DiscordTypography from "../../DiscordComponents/DiscordTypography/DiscordTypography";
import Box from "@mui/material/Box";

const ModalDebugMessage = ({ debugMessage }) => {
  return (
    <Box
      my={1}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        opacity: debugMessage.length === 0 ? 0 : 1,
      }}
    >
      <DiscordTypography variant="caption" sx={{ color: "orange" }}>
        {debugMessage.length === 0 ? "An Error Occurred!" : debugMessage}
      </DiscordTypography>
    </Box>
  );
};
export default ModalDebugMessage;
