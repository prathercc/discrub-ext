import { sendChromeMessage } from "../../../services/chrome-service";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../common-components/tooltip/tooltip";
import Box from "@mui/material/Box";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

const CloseWindowButton = () => {
  return (
    <Box sx={{ position: "fixed", top: "12px", right: "267px" }}>
      <Tooltip placement="left" title="Quit">
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
