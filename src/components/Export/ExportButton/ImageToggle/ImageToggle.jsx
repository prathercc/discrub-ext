import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadOffIcon from "@mui/icons-material/FileDownloadOff";
import { useDispatch, useSelector } from "react-redux";
import {
  selectExport,
  setDownloadImages,
} from "../../../../features/export/exportSlice";

const ImageToggle = () => {
  const dispatch = useDispatch();
  const { downloadImages, isExporting } = useSelector(selectExport);

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${!downloadImages ? "Not " : ""}Downloading Media`}
      description="Exports may be performed more slowly when downloading media"
    >
      <IconButton
        disabled={isExporting}
        onClick={() => dispatch(setDownloadImages(!downloadImages))}
        color={downloadImages ? "primary" : "secondary"}
      >
        {downloadImages ? <DownloadIcon /> : <FileDownloadOffIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ImageToggle;
