import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import { useDispatch, useSelector } from "react-redux";
import {
  selectExport,
  setSortOverride,
} from "../../../../features/export/exportSlice";

const SortDirectionToggle = () => {
  const dispatch = useDispatch();
  const { sortOverride, isExporting } = useSelector(selectExport);

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
        onClick={() =>
          dispatch(setSortOverride(sortOverride === "asc" ? "desc" : "asc"))
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
