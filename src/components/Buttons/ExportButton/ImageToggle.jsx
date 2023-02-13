import React, { useContext } from "react";
import IconButton from "@mui/material/IconButton";
import NoImageIcon from "@mui/icons-material/NoPhotography";
import ImageIcon from "@mui/icons-material/PhotoCamera";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { ExportContext } from "../../../context/export/ExportContext";

const ImageToggle = () => {
  const { state: exportState, setDownloadImages } = useContext(ExportContext);
  const { downloadImages, isExporting } = exportState;
  return (
    <Tooltip
      arrow
      placement="left"
      title={`${!downloadImages ? "Not " : ""}Downloading Images`}
      description="Exports can be performed more quickly when not downloading images"
    >
      <IconButton
        disabled={isExporting}
        onClick={async () => await setDownloadImages(!downloadImages)}
        color={downloadImages ? "primary" : "secondary"}
      >
        {downloadImages ? <ImageIcon /> : <NoImageIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ImageToggle;
