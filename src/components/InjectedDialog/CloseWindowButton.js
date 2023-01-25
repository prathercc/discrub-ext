import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import { sendChromeMessage } from "../../chromeService";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import CloseWindowButtonStyles from "./CloseWindowButton.styles";

const CloseWindowButton = () => {
  const classes = CloseWindowButtonStyles();
  return (
    <Box className={classes.boxContainer}>
      <Tooltip arrow title="Close">
        <IconButton
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
