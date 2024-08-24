import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../common-components/tooltip/tooltip";
import ImageIcon from "@mui/icons-material/Image";
import HideImageIcon from "@mui/icons-material/HideImage";
import { useExportSlice } from "../../../features/export/use-export-slice";
import { useAppSlice } from "../../../features/app/use-app-slice";
import { boolToString, stringToBool } from "../../../utils";
import { setSetting } from "../../../services/chrome-service";
import { DiscrubSetting } from "../../../enum/discrub-setting";

const PreviewImageToggle = () => {
  const { state: appState, setSettings } = useAppSlice();
  const settings = appState.settings();
  const { state: exportState } = useExportSlice();
  const previewImages = stringToBool(settings.exportPreviewMedia);
  const isExporting = exportState.isExporting();

  const handleToggle = async () => {
    const settings = await setSetting(
      DiscrubSetting.EXPORT_PREVIEW_MEDIA,
      boolToString(!previewImages)
    );
    setSettings(settings);
  };

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${!previewImages ? "Not " : ""}Previewing Media`}
      description="Previewing Media on a large number of messages can negatively affect the speed of the export."
    >
      <IconButton
        disabled={isExporting}
        onClick={handleToggle}
        color={previewImages ? "primary" : "secondary"}
      >
        {!previewImages ? <HideImageIcon /> : <ImageIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default PreviewImageToggle;
