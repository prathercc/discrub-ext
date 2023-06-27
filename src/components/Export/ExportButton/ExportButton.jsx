import React, { useContext, useRef } from "react";
import { Button } from "@mui/material";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import { GuildContext } from "../../../context/guild/GuildContext";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportMessages from "../../Export/ExportMessages/ExportMessages";
import { DmContext } from "../../../context/dm/DmContext";
import { ExportContext } from "../../../context/export/ExportContext";
import ExportModal from "../../Modals/ExportModal/ExportModal";

const ExportButton = ({
  dialogOpen,
  setDialogOpen,
  isDm = false,
  bulk = false,
}) => {
  const {
    state: exportState,
    setDownloadImages,
    setShowAvatars,
    setPreviewImages,
    setMessagesPerPage,
  } = useContext(ExportContext);
  const { isExporting, isGenerating } = exportState;

  const exportType = isDm ? "DM" : "Guild";
  const { state: messageState } = useContext(MessageContext);

  const { state: dmState } = useContext(DmContext);
  const { state: channelState } = useContext(ChannelContext);
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
      <ExportModal
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        bulk={bulk}
        isDm={isDm}
      />
    </>
  );
};

export default ExportButton;
