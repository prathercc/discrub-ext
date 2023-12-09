import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useDispatch, useSelector } from "react-redux";
import {
  selectExport,
  setDownloadFiles,
} from "../../../../features/export/exportSlice";

const FileToggle = () => {
  const dispatch = useDispatch();
  const { downloadFiles, isExporting } = useSelector(selectExport);

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${!downloadFiles ? "Not " : ""}Downloading Non-Media Files`}
      description="When toggled, all non-media attachment files will be downloaded as part of the export"
    >
      <IconButton
        disabled={isExporting}
        onClick={() => dispatch(setDownloadFiles(!downloadFiles))}
        color={downloadFiles ? "primary" : "secondary"}
      >
        {downloadFiles ? <FileOpenIcon /> : <InsertDriveFileIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default FileToggle;
