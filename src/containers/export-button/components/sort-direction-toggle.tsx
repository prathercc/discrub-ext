import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../common-components/tooltip/tooltip";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import { useExportSlice } from "../../../features/export/use-export-slice";
import { SortDirection } from "../../../enum/sort-direction";
import { useAppSlice } from "../../../features/app/use-app-slice";
import { setSetting } from "../../../services/chrome-service";
import { DiscrubSetting } from "../../../enum/discrub-setting";

const SortDirectionToggle = () => {
  const { state: appState, setSettings } = useAppSlice();
  const settings = appState.settings();
  const { state: exportState } = useExportSlice();
  const sortOverride = settings.exportMessageSortOrder;
  const isExporting = exportState.isExporting();

  const handleToggle = async () => {
    const settings = await setSetting(
      DiscrubSetting.EXPORT_MESSAGE_SORT_ORDER,
      sortOverride === SortDirection.DESCENDING
        ? SortDirection.ASCENDING
        : SortDirection.DESCENDING
    );
    setSettings(settings);
  };

  return (
    <Tooltip
      arrow
      placement="top"
      title={`Sort Messages ${
        sortOverride === SortDirection.ASCENDING ? "Ascending" : "Descending"
      }`}
      description={`Messages will be sorted by their date, ${
        sortOverride === SortDirection.ASCENDING ? "older" : "newer"
      } messages at the top.`}
    >
      <IconButton
        disabled={isExporting}
        onClick={handleToggle}
        color={
          sortOverride === SortDirection.ASCENDING ? "primary" : "secondary"
        }
      >
        {sortOverride === SortDirection.ASCENDING ? (
          <VerticalAlignTopIcon />
        ) : (
          <VerticalAlignBottomIcon />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default SortDirectionToggle;
