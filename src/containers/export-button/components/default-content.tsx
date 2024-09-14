import {
  DialogContent,
  DialogContentText,
  Stack,
  Typography,
} from "@mui/material";
import Progress from "./progress";
import Config from "../../discrub-dialog/components/config";
import { DiscrubSetting } from "../../../enum/discrub-setting";
import { AppSettings } from "../../../features/app/app-types";

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
      (s) => s !== DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS
    );
  }

  return (
    <DialogContent>
      {!isExporting && (
        <>
          <DialogContentText>
            <Typography variant="body2">
              <strong>{messageCount}</strong> messages are available to export
            </Typography>
          </DialogContentText>
          <Stack mt={1} mb={1} sx={{ maxHeight: "325px", overflow: "auto" }}>
            <Config
              onChangeSettings={onChangeSettings}
              visibleSettings={visibleSettings}
              settings={settings}
              containerProps={{ width: "auto" }}
            />
          </Stack>
        </>
      )}
      {isExporting && <Progress />}
    </DialogContent>
  );
};

export default DefaultContent;
