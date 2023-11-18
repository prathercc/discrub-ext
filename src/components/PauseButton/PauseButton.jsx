import React from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useDispatch, useSelector } from "react-redux";
import { selectApp, setDiscrubPaused } from "../../features/app/appSlice";

/**
 *
 * @param {boolean} disabled Boolean used to determine when the Pause Button is disabled.
 * @returns
 */
const PauseButton = ({ disabled = false }) => {
  const dispatch = useDispatch();
  const { discrubPaused, discrubCancelled } = useSelector(selectApp);

  return (
    <>
      <Button
        startIcon={discrubPaused ? <PlayArrowIcon /> : <PauseIcon />}
        disabled={discrubCancelled || disabled}
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
