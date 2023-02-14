import React, { useContext, useRef } from "react";
import { Button, Dialog, DialogTitle } from "@mui/material";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import { GuildContext } from "../../../context/guild/GuildContext";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportMessages from "../../Export/ExportMessages/ExportMessages";
import { DmContext } from "../../../context/dm/DmContext";
import ExportButtonStyles from "./ExportButton.styles";
import { ExportContext } from "../../../context/export/ExportContext";
import BulkContent from "./BulkContent";
import Actions from "./Actions";

const ExportButton = ({ dialogOpen, setDialogOpen, isDm = false }) => {
  const classes = ExportButtonStyles();

  const {
    state: exportState,
    setName,
    setIsExporting,
    setDownloadImages,
  } = useContext(ExportContext);
  const { isExporting } = exportState;

  const exportType = isDm ? "DM" : "Guild";
  const { state: messageState, resetMessageData } = useContext(MessageContext);

  const { state: dmState } = useContext(DmContext);
  const {
    state: channelState,
    setSelectedExportChannels,
    resetChannel,
  } = useContext(ChannelContext);
  const { state: guildState } = useContext(GuildContext);
  const { isLoading: messagesLoading, messages } = messageState;
  const { preFilterUserId, selectedChannel } = channelState;
  const { selectedDm, preFilterUserId: dmPreFilterUserId } = dmState;
  const { selectedGuild } = guildState;
  const exportingActiveRef = useRef();
  const contentRef = useRef();
  exportingActiveRef.current = isExporting;

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedExportChannels([]);
    resetChannel();
    resetMessageData();
    setName("");
    setIsExporting(false);
  };

  return (
    <>
      <Button
        disabled={
          (isDm ? selectedDm.id === null : selectedGuild.id === null) ||
          messagesLoading ||
          selectedChannel.id !== null ||
          messages.length > 0 ||
          !!dmPreFilterUserId ||
          !!preFilterUserId ||
          dialogOpen
        }
        onClick={async () => {
          await setDownloadImages(true);
          setDialogOpen(true);
        }}
        variant="contained"
      >
        Export {exportType}
      </Button>
      <ExportMessages componentRef={contentRef} />
      <Dialog
        PaperProps={{ className: classes.dialogPaper }}
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>Export {exportType}</DialogTitle>
        <BulkContent isDm={isDm} />
        <Actions
          contentRef={contentRef}
          setDialogOpen={setDialogOpen}
          isDm={isDm}
        />
      </Dialog>
    </>
  );
};

export default ExportButton;
