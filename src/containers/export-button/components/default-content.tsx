import { DialogContent, DialogContentText, Typography } from "@mui/material";
import Progress from "./progress";
import { DiscrubSetting } from "../../../enum/discrub-setting";
import { AppSettings } from "../../../features/app/app-types";
import ExportTabs, { ExportTab } from "./export-tabs.tsx";
import { getExportSettings } from "./bulk-content.tsx";

type DefaultContentProps = {
  isExporting: boolean;
  messageCount: number;
  isDm: boolean;
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
};

const DefaultContent = ({
  isExporting,
  messageCount,
  settings,
  onChangeSettings,
  isDm,
}: DefaultContentProps) => {
  let visibleSettings = [
    DiscrubSetting.EXPORT_ARTIST_MODE,
    DiscrubSetting.EXPORT_DOWNLOAD_MEDIA,
    DiscrubSetting.EXPORT_PREVIEW_MEDIA,
    DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS,
    DiscrubSetting.EXPORT_MESSAGES_PER_PAGE,
    DiscrubSetting.EXPORT_IMAGE_RES_MODE,
  ];
  if (isDm) {
    visibleSettings = visibleSettings.filter(
      (s) => s !== DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS,
    );
  }

  const configurationTab: ExportTab = {
    label: "Configuration",
    getComponent: () =>
      getExportSettings(onChangeSettings, visibleSettings, settings),
  };
  const tabs: ExportTab[] = [configurationTab];

  return (
    <DialogContent>
      {!isExporting && (
        <>
          <DialogContentText mb={1}>
            <Typography variant="h6">
              <strong>{messageCount}</strong> messages are available to export
            </Typography>
          </DialogContentText>
          <ExportTabs tabs={tabs} />
        </>
      )}
      {isExporting && <Progress />}
    </DialogContent>
  );
};

export default DefaultContent;
