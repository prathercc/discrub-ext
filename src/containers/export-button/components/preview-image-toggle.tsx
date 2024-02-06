import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../common-components/tooltip/tooltip";
import ImageIcon from "@mui/icons-material/Image";
import HideImageIcon from "@mui/icons-material/HideImage";
import { useExportSlice } from "../../../features/export/use-export-slice";

const PreviewImageToggle = () => {
  const { state: exportState, setPreviewImages } = useExportSlice();
  const previewImages = exportState.previewImages();
  const isExporting = exportState.isExporting();

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${!previewImages ? "Not " : ""}Previewing Media`}
      description="Previewing Media on a large number of messages can negatively affect the speed of the export."
    >
      <IconButton
        disabled={isExporting}
        onClick={() => setPreviewImages(!previewImages)}
        color={previewImages ? "primary" : "secondary"}
      >
        {!previewImages ? <HideImageIcon /> : <ImageIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default PreviewImageToggle;
