import React from "react";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  selectApp,
  setDiscrubCancelled,
  setDiscrubPaused,
} from "../../../features/app/appSlice";

/**
 *
 * @param {function} onCancel Function to override Cancel Button pressed behavior.
 * @param {boolean} disabled Boolean to determine if Cancel Button should be disabled.
 * @returns
 */
const CancelButton = ({ onCancel, disabled = false }) => {
  const dispatch = useDispatch();
  const { discrubCancelled } = useSelector(selectApp);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      dispatch(setDiscrubCancelled(true));
      dispatch(setDiscrubPaused(false));
    }
  };

  return (
    <Button
      disabled={discrubCancelled || disabled}
      color="secondary"
      variant="contained"
      onClick={handleCancel}
    >
      Cancel
    </Button>
  );
};

export default CancelButton;
