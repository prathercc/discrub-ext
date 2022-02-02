import React from "react";
import DiscordButton from "../DiscordComponents/DiscordButton/DiscordButton";
import { sendChromeMessage } from "../../chromeService";

function InjectedButton() {
  return (
    <div style={{ backgroundColor: "#36393f" }}>
      <DiscordButton
        label="Discrub"
        onClick={() => sendChromeMessage("INJECT_DIALOG")}
      />
    </div>
  );
}

export default InjectedButton;
