import React from "react";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { sendChromeMessage } from "../../chromeService";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";
import Box from "@mui/material/Box";
import CloseWindowButtonStyles from "./CloseWindowButton.styles";

const CloseWindowButton = () => {
  const classes = CloseWindowButtonStyles();
  return (
    <Box className={classes.boxContainer}>
      <Tooltip placement="left" arrow title="Exit Discrub">
        <IconButton
          onClick={() => sendChromeMessage("CLOSE_INJECTED_DIALOG")}
          color="error"
        >
          <CloseOutlinedIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default CloseWindowButton;
