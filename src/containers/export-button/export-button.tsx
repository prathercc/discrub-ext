import { useRef, useState } from "react";
import { Button } from "@mui/material";
import { useExportSlice } from "../../features/export/use-export-slice";
import ExportModal from "./components/export-modal";
import { useAppSlice } from "../../features/app/use-app-slice";
import { useChannelSlice } from "../../features/channel/use-channel-slice";
import ExportUtils from "../../features/export/export-utils";
import { useGuildSlice } from "../../features/guild/use-guild-slice";
import { useDmSlice } from "../../features/dm/use-dm-slice";
import { ExportType } from "../../enum/export-type";
import Channel from "../../classes/channel";
import DefaultContent from "./components/default-content";
import { useMessageSlice } from "../../features/message/use-message-slice";
import BulkContent from "./components/bulk-content";
import ExportMessages from "./components/export-messages";
import { sortByProperty } from "../../utils";
import Message from "../../classes/message";
import Guild from "../../classes/guild";

type ExportButtonProps = {
  bulk?: boolean;
  isDm?: boolean;
  disabled?: boolean;
};

const ExportButton = ({
  isDm = false,
  bulk = false,
  disabled = false,
}: ExportButtonProps) => {
  const {
    state: exportState,
    resetExportSettings,
    setIsGenerating,
    exportMessages,
  } = useExportSlice();
  const isGenerating = exportState.isGenerating();
  const isExporting = exportState.isExporting();
  const sortOverride = exportState.sortOverride();
  const currentPage = exportState.currentPage();
  const messagesPerPage = exportState.messagesPerPage();

  const { setDiscrubCancelled, setDiscrubPaused } = useAppSlice();

  const { state: channelState, setSelectedExportChannels } = useChannelSlice();
  const channels = channelState.channels();
  const selectedExportChannels = channelState.selectedExportChannels();
  const selectedChannel = channelState.selectedChannel();

  const { state: guildState } = useGuildSlice();
  const selectedGuild = guildState.selectedGuild();

  const { state: dmState } = useDmSlice();
  const selectedDm = dmState.selectedDm();

  const { state: messageState } = useMessageSlice();
  const messages = messageState.messages();
  const filteredMessages = messageState.filteredMessages();
  const filters = messageState.filters();

  const [dialogOpen, setDialogOpen] = useState(false);

  const exportType = isDm ? "DM" : "Server";

  const contentRef = useRef<HTMLDivElement | null>(null);

  const entity: Guild | Channel | Maybe = isDm
    ? selectedDm
    : selectedChannel || selectedGuild;

  const zipName = String(isDm ? selectedDm?.name : selectedGuild?.name);
  const exportUtils = new ExportUtils(
    contentRef,
    (e: boolean) => setIsGenerating(e),
    zipName
  );

  const handleDialogClose = () => {
    if (isGenerating || isExporting) {
      // We are actively exporting, we need to send a cancel request
      setDiscrubCancelled(true);
    }
    if (bulk) {
      setSelectedExportChannels([]);
    }
    setDiscrubPaused(false);
    setDialogOpen(false);
  };

  const handleExportSelected = async (format: ExportType = ExportType.JSON) => {
    let selectedChannels: Channel[] = [];
    if (isDm && selectedDm) {
      selectedChannels = [selectedDm];
    } else if (bulk) {
      selectedChannels = channels.filter((c) =>
        selectedExportChannels.some((id) => id === c.id)
      );
    } else if (selectedChannel) {
      selectedChannels = [selectedChannel];
    }

    exportMessages({ selectedChannels, exportUtils, bulk, format });
  };

  const exportDisabled =
    isExporting || (bulk && !isDm && selectedExportChannels.length === 0);
  const pauseDisabled = !isExporting;

  const getContentComponent = (): React.ReactNode => {
    if (bulk) {
      return (
        <BulkContent
          isDm={isDm}
          isExporting={isExporting}
          selectedExportChannels={selectedExportChannels}
          channels={channels}
          setSelectedExportChannels={setSelectedExportChannels}
        />
      );
    } else
      return (
        <DefaultContent
          isExporting={isExporting}
          messageCount={filteredMessages.length || messages.length}
        />
      );
  };

  const getExportMessages = (): Message[] => {
    let exportMessages = filters.length > 0 ? filteredMessages : messages;
    exportMessages = bulk
      ? exportMessages
          .map((m) => new Message({ ...m }))
          .sort((a, b) =>
            sortByProperty(
              Object.assign(a, { date: new Date(a.timestamp) }),
              Object.assign(b, { date: new Date(b.timestamp) }),
              "date",
              sortOverride
            )
          )
      : exportMessages;
    const startIndex =
      currentPage === 1 ? 0 : (currentPage - 1) * messagesPerPage;

    return exportMessages.slice(startIndex, startIndex + messagesPerPage);
  };

  const exportTitle = `Export ${bulk ? exportType : "Messages"}`;

  const getExportPageTitle = (): string => {
    return `Page ${currentPage} of ${Math.ceil(
      (filteredMessages.length ? filteredMessages.length : messages.length) /
        messagesPerPage
    )}`;
  };

  return (
    <>
      <Button
        disabled={disabled}
        onClick={async () => {
          resetExportSettings();
          setDialogOpen(true);
        }}
        variant="contained"
      >
        {exportTitle}
      </Button>
      {isGenerating && (
        <ExportMessages
          messages={getExportMessages()}
          componentRef={contentRef}
          isExporting={isExporting}
          entity={entity}
          getExportPageTitle={getExportPageTitle}
        />
      )}
      <ExportModal
        onCancel={handleDialogClose}
        handleExportSelected={handleExportSelected}
        dialogOpen={dialogOpen}
        exportDisabled={exportDisabled}
        pauseDisabled={pauseDisabled}
        ContentComponent={getContentComponent()}
        dialogTitle={exportTitle}
      />
    </>
  );
};

export default ExportButton;
