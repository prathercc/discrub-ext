import React, { useContext, useRef } from "react";
import { Button, Dialog, DialogTitle } from "@mui/material";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import { GuildContext } from "../../../context/guild/GuildContext";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportMessages from "../../Export/ExportMessages/ExportMessages";
import { DmContext } from "../../../context/dm/DmContext";
import ExportButtonStyles from "./Styles/ExportButton.styles";
import { ExportContext } from "../../../context/export/ExportContext";
import BulkContent from "./BulkContent";
import Actions from "./Actions";
import DefaultContent from "./DefaultContent";

const ExportButton = ({
  dialogOpen,
  setDialogOpen,
  isDm = false,
  bulk = false,
}) => {
  const classes = ExportButtonStyles();

  const {
    state: exportState,
    setName,
    setIsExporting,
    setDownloadImages,
    setShowAvatars,
    setPreviewImages,
    setMessagesPerPage,
  } = useContext(ExportContext);
  const { isExporting, isGenerating } = exportState;

  const exportType = isDm ? "DM" : "Guild";
  const { state: messageState, resetMessageData } = useContext(MessageContext);

  const { state: dmState } = useContext(DmContext);
  const {
    state: channelState,
    setSelectedExportChannels,
    resetChannel,
  } = useContext(ChannelContext);
  const { state: guildState } = useContext(GuildContext);
  const {
    isLoading: messagesLoading,
    messages,
    searchBeforeDate,
    searchAfterDate,
  } = messageState;
  const { preFilterUserId, selectedChannel } = channelState;
  const { selectedDm, preFilterUserId: dmPreFilterUserId } = dmState;
  const { selectedGuild } = guildState;
  const exportingActiveRef = useRef();
  const contentRef = useRef();
  exportingActiveRef.current = isExporting;

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

  const bulkDisabled =
    (isDm ? selectedDm.id === null : selectedGuild.id === null) ||
    messagesLoading ||
    selectedChannel.id !== null ||
    messages.length > 0 ||
    !!dmPreFilterUserId ||
    !!preFilterUserId ||
    !!searchBeforeDate ||
    !!searchAfterDate ||
    dialogOpen;

  return (
    <>
      <Button
        disabled={bulk && bulkDisabled}
        onClick={async () => {
          await setDownloadImages(false);
          await setShowAvatars(false);
          await setPreviewImages(false);
          await setMessagesPerPage(1000);
          setDialogOpen(true);
        }}
        variant="contained"
      >
        Export {bulk ? exportType : "Messages"}
      </Button>
      {isGenerating && <ExportMessages componentRef={contentRef} bulk={bulk} />}
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
    </>
  );
};

export default ExportButton;
