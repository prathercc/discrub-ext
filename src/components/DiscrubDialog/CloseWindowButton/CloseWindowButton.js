import React from "react";
import { sendChromeMessage } from "../../../services/chromeService";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import Box from "@mui/material/Box";
import CloseWindowButtonStyles from "../Styles/CloseWindowButton.styles";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

const CloseWindowButton = () => {
  const classes = CloseWindowButtonStyles();
  return (
    <Box className={classes.boxContainer}>
      <Tooltip placement="left" arrow title="Quit">
        <IconButton
          onClick={() => sendChromeMessage("CLOSE_INJECTED_DIALOG")}
          color="secondary"
        >
          <CloseOutlinedIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default CloseWindowButton;
