import { useState } from "react";
import { Button } from "@mui/material";
import PurgeModal from "./components/purge-modal";

type PurgeButtonProps = {
  isDm?: boolean;
  disabled?: boolean;
};

const PurgeButton = ({ isDm = false, disabled = false }: PurgeButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
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
