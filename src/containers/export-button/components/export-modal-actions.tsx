import { useState } from "react";
import { Button, Menu, MenuItem, DialogActions } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PauseButton from "../../../components/pause-button";
import CancelButton from "../../../components/cancel-button";
import { ExportType } from "../../../enum/export-type";
import Tooltip from "../../../common-components/tooltip/tooltip";

type ActionsProps = {
  handleExportSelected: (val: ExportType) => void;
  onCancel: () => void;
  exportDisabled: boolean;
  pauseDisabled: boolean;
  getTooltipDescription: (exportType: ExportType) => string;
};

const ExportModalActions = ({
  handleExportSelected,
  onCancel,
  exportDisabled,
  pauseDisabled,
  getTooltipDescription,
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

  const tooltipTitle = "Export Includes:";
  const tooltipPlacement = "left";

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
        <Tooltip
          placement={tooltipPlacement}
          title={tooltipTitle}
          description={getTooltipDescription(ExportType.HTML)}
        >
          <MenuItem dense onClick={() => handleExport(ExportType.HTML)}>
            HTML
          </MenuItem>
        </Tooltip>
        <Tooltip
          placement={tooltipPlacement}
          title={tooltipTitle}
          description={getTooltipDescription(ExportType.JSON)}
        >
          <MenuItem dense onClick={() => handleExport(ExportType.JSON)}>
            JSON
          </MenuItem>
        </Tooltip>
        <Tooltip
          placement={tooltipPlacement}
          title={tooltipTitle}
          description={getTooltipDescription(ExportType.MEDIA)}
        >
          <MenuItem dense onClick={() => handleExport(ExportType.MEDIA)}>
            Media Only
          </MenuItem>
        </Tooltip>
      </Menu>
    </DialogActions>
  );
};

export default ExportModalActions;
