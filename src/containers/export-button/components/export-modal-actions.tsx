import { useState } from "react";
import { Button, Menu, MenuItem, DialogActions } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PauseButton from "../../../components/pause-button";
import CancelButton from "../../../components/cancel-button";
import { ExportType } from "../../../enum/export-type";

type ActionsProps = {
  handleExportSelected: (val: ExportType) => void;
  onCancel: () => void;
  exportDisabled: boolean;
  pauseDisabled: boolean;
};

const ExportModalActions = ({
  handleExportSelected,
  onCancel,
  exportDisabled,
  pauseDisabled,
}: ActionsProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = !!anchorEl;
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (val: ExportType) => {
    handleClose();
    handleExportSelected(val);
  };

  return (
    <DialogActions>
      <CancelButton onCancel={onCancel} />
      <PauseButton disabled={pauseDisabled} />
      <Button
        disabled={exportDisabled}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Export
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem dense onClick={() => handleExport(ExportType.HTML)}>
          HTML
        </MenuItem>
        <MenuItem dense onClick={() => handleExport(ExportType.JSON)}>
          JSON
        </MenuItem>
      </Menu>
    </DialogActions>
  );
};

export default ExportModalActions;
