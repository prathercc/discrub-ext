import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../common-components/tooltip/tooltip";
import FormatColorResetIcon from "@mui/icons-material/FormatColorReset";
import BrushIcon from "@mui/icons-material/Brush";
import { useExportSlice } from "../../../features/export/use-export-slice";

const ArtistModeToggle = () => {
  const { state: exportState, setArtistMode } = useExportSlice();
  const artistMode = exportState.artistMode();
  const isExporting = exportState.isExporting();

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${!artistMode ? "Not " : ""}Using Artist Mode`}
      description="Artist Mode will store Attached & Embedded Media into folders named by their Author's username"
    >
      <IconButton
        disabled={isExporting}
        onClick={() => setArtistMode(!artistMode)}
        color={artistMode ? "primary" : "secondary"}
      >
        {artistMode ? <BrushIcon /> : <FormatColorResetIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ArtistModeToggle;
