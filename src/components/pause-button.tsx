import { Alert, Button, Snackbar } from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useAppSlice } from "../features/app/use-app-slice";

type PauseButtonProps = {
  disabled?: boolean;
};

const PauseButton = ({ disabled = false }: PauseButtonProps) => {
  const { state: appState, setDiscrubPaused } = useAppSlice();
  const discrubCancelled = appState.discrubCancelled();
  const discrubPaused = appState.discrubPaused();

  return (
    <>
      <Button
        startIcon={discrubPaused ? <PlayArrowIcon /> : <PauseIcon />}
        disabled={discrubCancelled || disabled}
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
