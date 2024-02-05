import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../common-components/tooltip/tooltip";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadOffIcon from "@mui/icons-material/FileDownloadOff";
import { useExportSlice } from "../../../features/export/use-export-slice";

const ImageToggle = () => {
  const { state: exportState, setDownloadImages } = useExportSlice();
  const downloadImages = exportState.downloadImages();
  const isExporting = exportState.isExporting();

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${!downloadImages ? "Not " : ""}Downloading Media`}
      description="Exports may be performed more slowly when downloading media"
    >
      <IconButton
        disabled={isExporting}
        onClick={() => setDownloadImages(!downloadImages)}
        color={downloadImages ? "primary" : "secondary"}
      >
        {downloadImages ? <DownloadIcon /> : <FileDownloadOffIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ImageToggle;
