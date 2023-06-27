import React from "react";
import { Box, IconButton } from "@mui/material";
import { sendChromeMessage } from "../../services/chromeService";
import DiscrubButtonStyles from "./Styles/DiscrubButton.styles";

function DiscrubButton() {
  const classes = DiscrubButtonStyles();

  return (
    <Box className={classes.buttonParent}>
      <IconButton
        size="small"
        variant="contained"
        onClick={() => sendChromeMessage("INJECT_DIALOG")}
      >
        <img
          className={classes.buttonLogo}
          src="discrub2.png"
          alt="Discrub Logo"
        />
      </IconButton>
    </Box>
  );
}

export default DiscrubButton;
