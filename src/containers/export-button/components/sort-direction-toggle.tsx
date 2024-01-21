import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../common-components/tooltip/tooltip";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import { useExportSlice } from "../../../features/export/use-export-slice";
import { SortDirection } from "../../../enum/sort-direction";

const SortDirectionToggle = () => {
  const { state: exportState, setSortOverride } = useExportSlice();
  const sortOverride = exportState.sortOverride();
  const isExporting = exportState.isExporting();

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
        onClick={() =>
          setSortOverride(
            sortOverride === SortDirection.ASCENDING
              ? SortDirection.DESCENDING
              : SortDirection.ASCENDING
          )
        }
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
