import React from "react";
import { IconButton } from "@mui/material";
import { sendChromeMessage } from "../../chromeService";

function InjectedButton() {
  return (
    <div style={{ backgroundColor: "#36393f" }}>
      <IconButton
        size="small"
        variant="contained"
        onClick={() => sendChromeMessage("INJECT_DIALOG")}
      >
        <img
          style={{ width: "24px", height: "24px" }}
          src="discrub2.png"
          alt="Discrub Logo"
        />
      </IconButton>
    </div>
  );
}

export default InjectedButton;
