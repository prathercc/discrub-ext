import React, { useContext } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { ExportContext } from "../../../context/export/ExportContext";
import ImageIcon from "@mui/icons-material/Image";
import HideImageIcon from "@mui/icons-material/HideImage";

const PreviewImageToggle = () => {
  const { state: exportState, setPreviewImages } = useContext(ExportContext);
  const { previewImages, isExporting } = exportState;
  return (
    <Tooltip
      arrow
      placement="left"
      title={`${!previewImages ? "Not " : ""}Previewing Images`}
      description="Previewing Images on a large number of messages can negatively affect the speed of the export."
    >
      <IconButton
        disabled={isExporting}
        onClick={async () => await setPreviewImages(!previewImages)}
        color={previewImages ? "primary" : "secondary"}
      >
        {!previewImages ? <HideImageIcon /> : <ImageIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default PreviewImageToggle;
