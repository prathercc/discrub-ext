import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../common-components/tooltip/tooltip";
import FormatColorResetIcon from "@mui/icons-material/FormatColorReset";
import BrushIcon from "@mui/icons-material/Brush";
import { useExportSlice } from "../../../features/export/use-export-slice";
import { boolToString, stringToBool } from "../../../utils";
import { useAppSlice } from "../../../features/app/use-app-slice";
import { setSetting } from "../../../services/chrome-service";
import { DiscrubSetting } from "../../../enum/discrub-setting";

const ArtistModeToggle = () => {
  const { state: appState, setSettings } = useAppSlice();
  const settings = appState.settings();
  const { state: exportState } = useExportSlice();
  const artistMode = stringToBool(settings.exportUseArtistMode);
  const isExporting = exportState.isExporting();

  const handleToggle = async () => {
    const settings = await setSetting(
      DiscrubSetting.EXPORT_ARTIST_MODE,
      boolToString(!artistMode)
    );
    setSettings(settings);
  };

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${!artistMode ? "Not " : ""}Using Artist Mode`}
      description="Artist Mode will store Attached & Embedded Media into folders named by their Author's username"
    >
      <IconButton
        disabled={isExporting}
        onClick={handleToggle}
        color={artistMode ? "primary" : "secondary"}
      >
        {artistMode ? <BrushIcon /> : <FormatColorResetIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ArtistModeToggle;
