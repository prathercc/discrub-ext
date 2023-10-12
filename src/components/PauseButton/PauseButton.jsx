import React, { useContext } from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import { MessageContext } from "../../context/message/MessageContext";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const PauseButton = ({ disabled = false }) => {
  const { state: messageState, setDiscrubPaused } = useContext(MessageContext);

  // TODO: Could we create another context for utility flags like this?
  const { discrubPaused } = messageState;

  return (
    <>
      <Button
        startIcon={discrubPaused ? <PlayArrowIcon /> : <PauseIcon />}
        disabled={disabled}
        color="secondary"
        variant="contained"
        onClick={() => setDiscrubPaused(!discrubPaused)}
      >
        {discrubPaused ? "Resume" : "Pause"}
      </Button>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={discrubPaused}
      >
        <Alert severity="warning">Paused</Alert>
      </Snackbar>
    </>
  );
};

export default PauseButton;
