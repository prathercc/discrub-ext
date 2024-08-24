import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../common-components/tooltip/tooltip";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadOffIcon from "@mui/icons-material/FileDownloadOff";
import { useExportSlice } from "../../../features/export/use-export-slice";
import { useAppSlice } from "../../../features/app/use-app-slice";
import { setSetting } from "../../../services/chrome-service";
import { boolToString, stringToBool } from "../../../utils";
import { DiscrubSetting } from "../../../enum/discrub-setting";

const ImageToggle = () => {
  const { state: appState, setSettings } = useAppSlice();
  const settings = appState.settings();
  const { state: exportState } = useExportSlice();
  const downloadImages = stringToBool(settings.exportDownloadMedia);
  const isExporting = exportState.isExporting();

  const handleToggle = async () => {
    const settings = await setSetting(
      DiscrubSetting.EXPORT_DOWNLOAD_MEDIA,
      boolToString(!downloadImages)
    );
    setSettings(settings);
  };

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${!downloadImages ? "Not " : ""}Downloading Media`}
      description="Exports may be performed more slowly when downloading media"
    >
      <IconButton
        disabled={isExporting}
        onClick={handleToggle}
        color={downloadImages ? "primary" : "secondary"}
      >
        {downloadImages ? <DownloadIcon /> : <FileDownloadOffIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ImageToggle;
