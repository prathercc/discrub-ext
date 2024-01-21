import { Box, IconButton } from "@mui/material";
import { sendChromeMessage } from "../../services/chrome-service";

function DiscrubButton() {
  return (
    <Box>
      <IconButton
        size="small"
        onClick={() => sendChromeMessage("INJECT_DIALOG")}
      >
        <img
          style={{ width: "24px", height: "24px" }}
          src="resources/media/discrub2.png"
          alt="Discrub Logo"
        />
      </IconButton>
    </Box>
  );
}

export default DiscrubButton;
