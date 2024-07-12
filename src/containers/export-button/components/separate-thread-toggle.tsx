import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../common-components/tooltip/tooltip";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import { useExportSlice } from "../../../features/export/use-export-slice";

const SeparateThreadToggle = () => {
  const { state: exportState, setFolderingThreads } = useExportSlice();
  const folderingThreads = exportState.folderingThreads();
  const isExporting = exportState.isExporting();

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${
        !folderingThreads ? "Not " : ""
      }Foldering Threads & Forum Posts`}
      description="Foldering Threads & Forum Posts will store any existing threads or forum posts into separate files for better readability."
    >
      <IconButton
        disabled={isExporting}
        onClick={() => setFolderingThreads(!folderingThreads)}
        color={folderingThreads ? "primary" : "secondary"}
      >
        {folderingThreads ? <FolderIcon /> : <FolderOffIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default SeparateThreadToggle;
