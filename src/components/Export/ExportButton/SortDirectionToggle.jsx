import React, { useContext } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { ExportContext } from "../../../context/export/ExportContext";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";

const SortDirectionToggle = () => {
  const { state: exportState, setSortOverride } = useContext(ExportContext);
  const { sortOverride, isExporting } = exportState;
  return (
    <Tooltip
      arrow
      placement="top"
      title={`Sort Messages ${
        sortOverride === "asc" ? "Ascending" : "Descending"
      }`}
      description={`Messages will be sorted by their date, ${
        sortOverride === "asc" ? "older" : "newer"
      } messages at the top.`}
    >
      <IconButton
        disabled={isExporting}
        onClick={async () =>
          await setSortOverride(sortOverride === "asc" ? "desc" : "asc")
        }
        color={sortOverride === "asc" ? "primary" : "secondary"}
      >
        {sortOverride === "asc" ? (
          <VerticalAlignTopIcon />
        ) : (
          <VerticalAlignBottomIcon />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default SortDirectionToggle;
