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
import { punctuateStringArr, stringToBool } from "../../utils";

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
    setIsGenerating,
    exportMessages,
    exportChannels,
  } = useExportSlice();
  const isGenerating = exportState.isGenerating();
  const isExporting = exportState.isExporting();
  const currentPage = exportState.currentPage();
  const activeExportMessages = exportState.exportMessages();
  const totalPages = exportState.totalPages();
  const entity = exportState.currentExportEntity();
  const name = exportState.name();

  const {
    setDiscrubCancelled,
    setDiscrubPaused,
    setSettings,
    state: appState,
  } = useAppSlice();
  const settings = appState.settings();
  const folderingThreads = stringToBool(
    settings.exportSeparateThreadAndForumPosts
  );
  const artistMode = stringToBool(settings.exportUseArtistMode);
  const previewImages = stringToBool(settings.exportPreviewMedia);
  const downloadImages = stringToBool(settings.exportDownloadMedia);

  const { state: channelState, setSelectedExportChannels } = useChannelSlice();
  const channels = channelState.channels();
  const selectedExportChannels = channelState.selectedExportChannels();
  const selectedChannel = channelState.selectedChannel();

  const { state: guildState } = useGuildSlice();
  const selectedGuild = guildState.selectedGuild();
  const userId = guildState.preFilterUserId();

  const { state: dmState } = useDmSlice();
  const selectedDms = dmState.selectedDms();

  const { state: messageState } = useMessageSlice();
  const messages = messageState.messages();
  const filteredMessages = messageState.filteredMessages();
  const filters = messageState.filters();

  const [dialogOpen, setDialogOpen] = useState(false);

  const exportType = isDm
    ? `DM${selectedDms.length > 1 ? "'s" : ""}`
    : "Server";

  const contentRef = useRef<HTMLDivElement | null>(null);

  const getZipName = () => {
    if (isDm) {
      return bulk ? "Direct Messages" : String(selectedDms[0]?.name);
    } else {
      return String(selectedGuild?.name);
    }
  };

  const exportUtils = new ExportUtils(
    contentRef,
    (e: boolean) => setIsGenerating(e),
    getZipName()
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
    if (bulk) {
      let channelsToExport: Channel[] = [];
      if (isDm && selectedDms.length) {
        channelsToExport = [...selectedDms];
      } else if (selectedGuild) {
        channelsToExport = channels.filter((c) =>
          selectedExportChannels.some((id) => id === c.id)
        );
      }
      if (channelsToExport.length) {
        exportChannels(
          channelsToExport,
          exportUtils,
          format,
          userId || undefined
        );
      }
    } else {
      const entity = isDm ? selectedDms[0] : selectedChannel || selectedGuild;
      const messagesToExport = filters.length ? filteredMessages : messages;
      if (entity && messagesToExport.length) {
        exportMessages(
          messagesToExport,
          entity.name || entity.id,
          exportUtils,
          format
        );
      }
    }
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
          settings={settings}
          onChangeSettings={setSettings}
        />
      );
    } else
      return (
        <DefaultContent
          isDm={isDm}
          isExporting={isExporting}
          messageCount={
            filters.length ? filteredMessages?.length : messages.length
          }
          settings={settings}
          onChangeSettings={setSettings}
        />
      );
  };

  const exportTitle = `Export ${bulk ? exportType : "Messages"}`;

  const getTooltipDescription = (exportType: ExportType): string => {
    const descriptionArr: string[] = [];

    if (exportType !== ExportType.MEDIA) {
      const exportAccessories: string[] = [
        `${exportType.toUpperCase()} Format`,
      ];

      if (previewImages && exportType === ExportType.HTML) {
        exportAccessories.push("Media Previewed");
      }

      if (folderingThreads) {
        exportAccessories.push("Threads & Forum Posts Foldered");
      }

      const accessory = punctuateStringArr(exportAccessories);
      descriptionArr.push(
        `Messages ${accessory.length ? `(${accessory})` : ""}`
      );
    }

    if (downloadImages) {
      descriptionArr.push(
        `Attached & Embedded Media${artistMode ? " (Artist Mode)" : ""}`
      );
    }
    if (!isDm) {
      descriptionArr.push("Roles");
    }
    return `${descriptionArr.join(", ")}${
      descriptionArr.length ? ", " : ""
    }Emojis, and Avatars`;
  };

  return (
    <>
      <Button
        disabled={disabled}
        onClick={async () => {
          setDialogOpen(true);
        }}
        variant="contained"
      >
        {exportTitle}
      </Button>
      {isGenerating && (
        <ExportMessages
          messages={activeExportMessages}
          componentRef={contentRef}
          isExporting={isExporting}
          entity={entity}
          currentPage={currentPage}
          totalPages={totalPages}
          safeEntityName={name}
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
        getTooltipDescription={getTooltipDescription}
      />
    </>
  );
};

export default ExportButton;
