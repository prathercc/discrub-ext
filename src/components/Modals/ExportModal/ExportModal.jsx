import React, { useContext, useRef } from "react";
import { Dialog, DialogTitle } from "@mui/material";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportButtonStyles from "../../Export/ExportButton/Styles/ExportButton.styles";
import { ExportContext } from "../../../context/export/ExportContext";
import BulkContent from "../../Export/ExportButton/BulkContent/BulkContent";
import Actions from "../../Export/ExportButton/Actions/Actions";
import DefaultContent from "../../Export/ExportButton/DefaultContent/DefaultContent";

const ExportModal = ({
  dialogOpen,
  setDialogOpen,
  isDm = false,
  bulk = false,
  contentRef,
}) => {
  const classes = ExportButtonStyles();

  const { setName, setIsExporting } = useContext(ExportContext);

  const exportType = isDm ? "DM" : "Guild";
  const { resetMessageData } = useContext(MessageContext);

  const { setSelectedExportChannels, resetChannel } =
    useContext(ChannelContext);

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (bulk) {
      setSelectedExportChannels([]);
      resetChannel();
      resetMessageData();
    }
    setName("");
    setIsExporting(false);
  };

  return (
    <Dialog
      PaperProps={{ className: classes.dialogPaper }}
      open={dialogOpen}
      onClose={handleDialogClose}
    >
      <DialogTitle>Export {bulk ? exportType : "Messages"}</DialogTitle>
      {bulk ? <BulkContent isDm={isDm} /> : <DefaultContent />}
      <Actions
        contentRef={contentRef}
        setDialogOpen={setDialogOpen}
        isDm={isDm}
        bulk={bulk}
      />
    </Dialog>
  );
};

export default ExportModal;
