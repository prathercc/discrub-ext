import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import ImageIcon from "@mui/icons-material/Image";
import HideImageIcon from "@mui/icons-material/HideImage";
import { useDispatch, useSelector } from "react-redux";
import {
  selectExport,
  setPreviewImages,
} from "../../../../features/export/exportSlice";

const PreviewImageToggle = () => {
  const dispatch = useDispatch();
  const { previewImages, isExporting } = useSelector(selectExport);

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${!previewImages ? "Not " : ""}Previewing Media`}
      description="Previewing Media on a large number of messages can negatively affect the speed of the export."
    >
      <IconButton
        disabled={isExporting}
        onClick={() => dispatch(setPreviewImages(!previewImages))}
        color={previewImages ? "primary" : "secondary"}
      >
        {!previewImages ? <HideImageIcon /> : <ImageIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default PreviewImageToggle;
