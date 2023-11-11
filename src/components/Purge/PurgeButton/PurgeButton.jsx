import React from "react";
import { Button } from "@mui/material";
import PurgeModal from "../../Modals/PurgeModal/PurgeModal";

const PurgeButton = ({
  dialogOpen,
  setDialogOpen,
  isDm = false,
  disabled = false,
}) => {
  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => {
          setDialogOpen(true);
        }}
        variant="contained"
      >
        Purge
      </Button>
      <PurgeModal
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        isDm={isDm}
      />
    </>
  );
};

export default PurgeButton;
