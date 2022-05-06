import React from "react";
import { Button } from "@mui/material";
import { sendChromeMessage } from "../../chromeService";

function InjectedButton() {
  return (
    <div style={{ backgroundColor: "#36393f" }}>
      <Button
        variant="contained"
        onClick={() => sendChromeMessage("INJECT_DIALOG")}
      >
        Discrub
      </Button>
    </div>
  );
}

export default InjectedButton;
