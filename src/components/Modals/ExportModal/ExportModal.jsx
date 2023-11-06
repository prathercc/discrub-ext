import React from "react";
import { Dialog, DialogTitle } from "@mui/material";
import ExportButtonStyles from "../../Export/ExportButton/Styles/ExportButton.styles";
import BulkContent from "../../Export/ExportButton/BulkContent/BulkContent";
import Actions from "../../Export/ExportButton/Actions/Actions";
import DefaultContent from "../../Export/ExportButton/DefaultContent/DefaultContent";
import { useDispatch } from "react-redux";
import {
  resetChannel,
  setSelectedExportChannels,
} from "../../../features/channel/channelSlice";
import {
  resetMessageData,
  setDiscrubPaused,
} from "../../../features/message/messageSlice";
import { setIsExporting, setName } from "../../../features/export/exportSlice";

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

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (bulk) {
      dispatch(setSelectedExportChannels([]));
      dispatch(resetChannel());
      dispatch(resetMessageData());
    }
    dispatch(setName(""));
    dispatch(setIsExporting(false));
    dispatch(setDiscrubPaused(false));
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
