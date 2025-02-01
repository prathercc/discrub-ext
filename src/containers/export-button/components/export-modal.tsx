import { Dialog } from "@mui/material";
import { ExportType } from "../../../enum/export-type";
import ExportModalActions from "./export-modal-actions";
import React from "react";
import EnhancedDialogTitle from "../../../common-components/enhanced-dialog/enhanced-dialog-title.tsx";

type ExportModalProps = {
  handleExportSelected: (val: ExportType) => void;
  onCancel: () => void;
  dialogOpen: boolean;
  exportDisabled: boolean;
  pauseDisabled: boolean;
  ContentComponent: React.ReactNode;
  dialogTitle: string;
  getTooltipDescription: (exportType: ExportType) => string;
};

const ExportModal = ({
  dialogOpen,
  handleExportSelected,
  exportDisabled,
  pauseDisabled,
  onCancel,
  ContentComponent,
  dialogTitle,
  getTooltipDescription,
}: ExportModalProps) => {
  return (
    <Dialog
      hideBackdrop
      PaperProps={{ sx: { minWidth: "500px", minHeight: "500px" } }}
      open={dialogOpen}
    >
      <EnhancedDialogTitle title={dialogTitle} onClose={onCancel} />
      {ContentComponent}
      <ExportModalActions
        handleExportSelected={handleExportSelected}
        exportDisabled={exportDisabled}
        pauseDisabled={pauseDisabled}
        onCancel={onCancel}
        getTooltipDescription={getTooltipDescription}
      />
    </Dialog>
  );
};

export default ExportModal;
