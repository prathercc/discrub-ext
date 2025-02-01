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
import EnhancedTabs, {
  EnhancedTab,
} from "../../../common-components/enhanced-tabs/enhanced-tabs.tsx";
import SearchCriteria, {
  defaultCriteria,
  SearchCriteriaComponentType,
} from "../../search-criteria/search-criteria.tsx";

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

  const channelSelectionTab: EnhancedTab = {
    label: "Channels",
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

  const criteriaTab: EnhancedTab = {
    label: "Criteria",
    getComponent: () => (
      <SearchCriteria
        isDm={isDm}
        componentType={SearchCriteriaComponentType.Form}
        visibleCriteria={defaultCriteria}
      />
    ),
  };

  const configurationTab: EnhancedTab = {
    label: "Configuration",
    getComponent: () =>
      getExportSettings(onChangeSettings, visibleSettings, settings),
  };

  const settingsTab: EnhancedTab = {
    label: "Settings",
    getComponent: () =>
      getExportSettings(
        onChangeSettings,
        [
          DiscrubSetting.RANDOM_SEARCH_DELAY,
          DiscrubSetting.APP_USER_DATA_REFRESH_RATE,
          DiscrubSetting.REACTIONS_ENABLED,
          DiscrubSetting.DISPLAY_NAME_LOOKUP,
          ...(isDm ? [] : [DiscrubSetting.SERVER_NICKNAME_LOOKUP]),
        ],
        settings,
      ),
  };

  const guildTabs: EnhancedTab[] = [
    channelSelectionTab,
    configurationTab,
    settingsTab,
    criteriaTab,
  ];
  const dmTabs: EnhancedTab[] = [configurationTab, settingsTab, criteriaTab];

  return (
    <DialogContent>
      {!isExporting && !isDm && <EnhancedTabs tabs={guildTabs} />}
      {!isExporting && isDm && <EnhancedTabs tabs={dmTabs} />}
      {isExporting && <Progress />}
    </DialogContent>
  );
};

export default BulkContent;
