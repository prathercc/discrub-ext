import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../common-components/tooltip/tooltip";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import { useExportSlice } from "../../../features/export/use-export-slice";
import { useAppSlice } from "../../../features/app/use-app-slice";
import { setSetting } from "../../../services/chrome-service";
import { DiscrubSetting } from "../../../enum/discrub-setting";
import { boolToString, stringToBool } from "../../../utils";

const SeparateThreadToggle = () => {
  const { setSettings, state: appState } = useAppSlice();
  const settings = appState.settings();
  const folderingThreads = stringToBool(
    settings.exportSeparateThreadAndForumPosts
  );

  const { state: exportState } = useExportSlice();
  const isExporting = exportState.isExporting();

  const handleToggle = async () => {
    const settings = await setSetting(
      DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS,
      boolToString(!folderingThreads)
    );
    setSettings(settings);
  };

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${
        !folderingThreads ? "Not " : ""
      }Separating Threads & Forum Posts`}
      description="Separating Threads & Forum Posts will store any existing threads or forum posts into separate files for better readability."
    >
      <IconButton
        disabled={isExporting}
        onClick={handleToggle}
        color={folderingThreads ? "primary" : "secondary"}
      >
        {folderingThreads ? <FolderIcon /> : <FolderOffIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default SeparateThreadToggle;
