import React from "react";
import { Dialog, DialogTitle } from "@mui/material";
import ExportButtonStyles from "../../Export/ExportButton/Styles/ExportButton.styles";
import BulkContent from "../../Export/ExportButton/BulkContent/BulkContent";
import Actions from "../../Export/ExportButton/Actions/Actions";
import DefaultContent from "../../Export/ExportButton/DefaultContent/DefaultContent";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedExportChannels } from "../../../features/channel/channelSlice";
import {
  setDiscrubCancelled,
  setDiscrubPaused,
} from "../../../features/message/messageSlice";
import { selectExport } from "../../../features/export/exportSlice";

const ExportModal = ({
  dialogOpen,
  setDialogOpen,
  isDm = false,
  bulk = false,
  contentRef,
}) => {
  const classes = ExportButtonStyles();
  const dispatch = useDispatch();
  const exportType = isDm ? "DM" : "Guild";

  const { isGenerating, isExporting } = useSelector(selectExport);

  const handleDialogClose = () => {
    if (isGenerating || isExporting) {
      // We are actively exporting, we need to send a cancel request
      dispatch(setDiscrubCancelled(true));
    }
    if (bulk) {
      dispatch(setSelectedExportChannels([]));
    }
    dispatch(setDiscrubPaused(false));
    setDialogOpen(false);
  };

  return (
    <Dialog PaperProps={{ className: classes.dialogPaper }} open={dialogOpen}>
      <DialogTitle>Export {bulk ? exportType : "Messages"}</DialogTitle>
      {bulk ? <BulkContent isDm={isDm} /> : <DefaultContent />}
      <Actions
        contentRef={contentRef}
        handleDialogClose={handleDialogClose}
        isDm={isDm}
        bulk={bulk}
      />
    </Dialog>
  );
};

export default ExportModal;
