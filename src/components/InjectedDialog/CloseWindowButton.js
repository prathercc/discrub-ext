import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import { sendChromeMessage } from "../../chromeService";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { textSecondary } from "../../styleConstants";

const CloseWindowButton = () => {
  return (
    <Box sx={{ position: "fixed", top: "5px", right: "5px" }}>
      <Tooltip title="Close">
        <IconButton
          sx={{
            "&:hover": { color: "rgb(166, 2, 2)" },
            color: textSecondary,
          }}
          onClick={() => sendChromeMessage("CLOSE_INJECTED_DIALOG")}
          color="primary"
        >
          <CancelIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default CloseWindowButton;
