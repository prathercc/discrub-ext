import React from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMessage,
  setDiscrubPaused,
} from "../../features/message/messageSlice";

const PauseButton = ({ disabled = false }) => {
  const dispatch = useDispatch();
  const { discrubPaused } = useSelector(selectMessage);

  return (
    <>
      <Button
        startIcon={discrubPaused ? <PlayArrowIcon /> : <PauseIcon />}
        disabled={disabled}
        color="secondary"
        variant="contained"
        onClick={() => dispatch(setDiscrubPaused(!discrubPaused))}
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
