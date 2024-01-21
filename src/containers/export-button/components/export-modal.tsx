import { Dialog, DialogTitle } from "@mui/material";
import { ExportType } from "../../../enum/export-type";
import ExportModalActions from "./export-modal-actions";
import React from "react";

type ExportModalProps = {
  handleExportSelected: (val: ExportType) => void;
  onCancel: () => void;
  dialogOpen: boolean;
  exportDisabled: boolean;
  pauseDisabled: boolean;
  ContentComponent: React.ReactNode;
  dialogTitle: string;
};

const ExportModal = ({
  dialogOpen,
  handleExportSelected,
  exportDisabled,
  pauseDisabled,
  onCancel,
  ContentComponent,
  dialogTitle,
}: ExportModalProps) => {
  return (
    <Dialog PaperProps={{ sx: { minWidth: "398px" } }} open={dialogOpen}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      {ContentComponent}
      <ExportModalActions
        handleExportSelected={handleExportSelected}
        exportDisabled={exportDisabled}
        pauseDisabled={pauseDisabled}
        onCancel={onCancel}
      />
    </Dialog>
  );
};

export default ExportModal;
