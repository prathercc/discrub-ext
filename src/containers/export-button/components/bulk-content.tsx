import {
  DialogContent,
  DialogContentText,
  Stack,
  Typography,
} from "@mui/material";
import Progress from "./progress";
import Channel from "../../../classes/channel";
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
import EnhancedAutocomplete from "../../../common-components/enhanced-autocomplete/enhanced-autocomplete.tsx";
import {
  filterBoth,
  getEntityHint,
  getIconUrl,
  getSortedChannels,
} from "../../../utils.ts";
import Tooltip from "../../../common-components/tooltip/tooltip.tsx";
import { EntityHint } from "../../../enum/entity-hint.ts";

type BulkContentProps = {
  isDm?: boolean;
  isExporting: boolean;
  selectedExportChannels: Snowflake[];
  channels: Channel[];
  setSelectedExportChannels: (ids: Snowflake[]) => void;
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
  loadChannel: (e: string) => void;
};

export const getExportSettings = (
  visibleSettings: DiscrubSetting[],
  isDm: boolean,
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
        isDm={isDm}
        visibleSettings={visibleSettings}
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
  loadChannel,
}: BulkContentProps) => {
  const sortedChannels = getSortedChannels(channels);
  const handleSelectAll = () => {
    if (selectedExportChannels.length !== channels.length) {
      setSelectedExportChannels(channels.map((c) => c.id));
    } else {
      setSelectedExportChannels([]);
    }
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
          <Typography variant="body1">
            {selectedExportChannels.length
              ? `${selectedExportChannels.length} Channel${
                  selectedExportChannels.length === 1 ? "" : "s"
                } Selected`
              : "Select Channels To Export"}
          </Typography>
        </DialogContentText>
        <Stack direction="row" mt={1}>
          <Tooltip
            title="Channels"
            description={getEntityHint(EntityHint.THREAD)}
          >
            <EnhancedAutocomplete
              label="Channels To Export"
              options={sortedChannels.map((c) => c.id)}
              value={selectedExportChannels}
              onChange={(e) => {
                if (Array.isArray(e)) {
                  filterBoth(
                    e,
                    selectedExportChannels,
                    channels.map(({ id }) => id),
                  ).forEach((id) => loadChannel(id));
                  setSelectedExportChannels(e);
                }
              }}
              onSelectAll={handleSelectAll}
              getOptionLabel={(e) =>
                channels.find((c) => c.id === e)?.name || e
              }
              getOptionIconSrc={(id) => {
                const channel = channels.find((c) => c.id === id);
                return channel && getIconUrl(channel);
              }}
              multiple
              optionIconStyle={{ filter: "invert(50%)" }}
              copyValue={sortedChannels.map((c) => c.name).join("\r\n")}
              copyName="Channel List"
              freeSolo
            />
          </Tooltip>
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
    label: "Config",
    getComponent: () => getExportSettings(visibleSettings, isDm),
  };

  const settingsTab: EnhancedTab = {
    label: "Settings",
    getComponent: () =>
      getExportSettings(
        [
          DiscrubSetting.DELAY_MODIFIER,
          DiscrubSetting.SEARCH_DELAY,
          DiscrubSetting.DATE_FORMAT,
          DiscrubSetting.TIME_FORMAT,
          DiscrubSetting.APP_USER_DATA_REFRESH_RATE,
          DiscrubSetting.REACTIONS_ENABLED,
          DiscrubSetting.DISPLAY_NAME_LOOKUP,
          ...(isDm ? [] : [DiscrubSetting.SERVER_NICKNAME_LOOKUP]),
        ],
        isDm,
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
