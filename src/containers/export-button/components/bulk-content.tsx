import {
  DialogContent,
  DialogContentText,
  Stack,
  Typography,
} from "@mui/material";
import Progress from "./progress";
import Channel from "../../../classes/channel";
import ChannelSelection from "./channel-selection";
import Config from "../../discrub-dialog/components/config";
import { AppSettings } from "../../../features/app/app-types";
import { DiscrubSetting } from "../../../enum/discrub-setting";
import ExportTabs, { ExportTab } from "./export-tabs.tsx";

type BulkContentProps = {
  isDm?: boolean;
  isExporting: boolean;
  selectedExportChannels: Snowflake[];
  channels: Channel[];
  setSelectedExportChannels: (ids: Snowflake[]) => void;
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
};

export const getExportSettings = (
  onChangeSettings: (settings: AppSettings) => void,
  visibleSettings: DiscrubSetting[],
  settings: AppSettings,
) => {
  return (
    <Stack
      mt={1}
      mb={1}
      sx={{
        maxHeight: "300px",
        overflow: "auto",
        width: "100%",
        overflowX: "hidden",
      }}
      direction="column"
      alignItems="center"
    >
      <Config
        onChangeSettings={onChangeSettings}
        visibleSettings={visibleSettings}
        settings={settings}
        containerProps={{ width: "85%" }}
      />
    </Stack>
  );
};

const BulkContent = ({
  isDm = false,
  isExporting,
  selectedExportChannels,
  channels,
  setSelectedExportChannels,
  settings,
  onChangeSettings,
}: BulkContentProps) => {
  const handleChannelSelect = (id: Snowflake) => {
    const isSelected = selectedExportChannels.some((cId) => cId === id);
    if (isSelected) {
      setSelectedExportChannels([
        ...selectedExportChannels.filter((cId) => cId !== id),
      ]);
    } else {
      setSelectedExportChannels([...selectedExportChannels, id]);
    }
  };

  const toggleSelectAll = (filteredChannels: Channel[]) => {
    setSelectedExportChannels(
      selectedExportChannels.length ? [] : filteredChannels.map((c) => c.id),
    );
  };
  let visibleSettings = [
    DiscrubSetting.EXPORT_ARTIST_MODE,
    DiscrubSetting.EXPORT_DOWNLOAD_MEDIA,
    DiscrubSetting.EXPORT_PREVIEW_MEDIA,
    DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS,
    DiscrubSetting.EXPORT_MESSAGE_SORT_ORDER,
    DiscrubSetting.EXPORT_MESSAGES_PER_PAGE,
    DiscrubSetting.EXPORT_IMAGE_RES_MODE,
  ];
  if (isDm) {
    visibleSettings = visibleSettings.filter(
      (s) => s !== DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS,
    );
  }

  const channelSelectionTab: ExportTab = {
    label: "Channel Selection",
    getComponent: () => (
      <>
        <DialogContentText>
          <Typography variant="body2">
            {selectedExportChannels.length
              ? `${selectedExportChannels.length} Channel${
                  selectedExportChannels.length === 1 ? "" : "s"
                } selected`
              : "Select Channel(s) to export"}
          </Typography>
        </DialogContentText>
        <Stack direction="row" spacing={3}>
          <ChannelSelection
            channels={channels}
            selectedExportChannels={selectedExportChannels}
            handleChannelSelect={handleChannelSelect}
            onSelectAll={toggleSelectAll}
          />
        </Stack>
      </>
    ),
  };
  const configurationTab: ExportTab = {
    label: "Configuration",
    getComponent: () =>
      getExportSettings(onChangeSettings, visibleSettings, settings),
  };
  const guildTabs: ExportTab[] = [channelSelectionTab, configurationTab];
  const dmTabs: ExportTab[] = [configurationTab];

  return (
    <DialogContent>
      {!isExporting && !isDm && <ExportTabs tabs={guildTabs} />}
      {!isExporting && isDm && <ExportTabs tabs={dmTabs} />}
      {isExporting && <Progress />}
    </DialogContent>
  );
};

export default BulkContent;
