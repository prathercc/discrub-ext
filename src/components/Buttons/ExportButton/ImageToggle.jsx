import React, { useContext } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { ExportContext } from "../../../context/export/ExportContext";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadOffIcon from "@mui/icons-material/FileDownloadOff";

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
        {downloadImages ? <DownloadIcon /> : <FileDownloadOffIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ImageToggle;
