import { Button, SxProps } from "@mui/material";
import { useAppSlice } from "../features/app/use-app-slice";

type CancelButtonProps = {
  disabled?: boolean;
  onCancel?: () => void;
  sx?: SxProps;
};

const CancelButton = ({
  onCancel,
  disabled = false,
  sx = {},
}: CancelButtonProps) => {
  const {
    state: appState,
    setDiscrubCancelled,
    setDiscrubPaused,
  } = useAppSlice();
  const discrubCancelled = appState.discrubCancelled();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setDiscrubCancelled(true);
      setDiscrubPaused(false);
    }
  };

  return (
    <Button
      disabled={discrubCancelled || disabled}
      color="secondary"
      variant="contained"
      onClick={handleCancel}
      sx={{ ...sx }}
    >
      Cancel
    </Button>
  );
};

export default CancelButton;
