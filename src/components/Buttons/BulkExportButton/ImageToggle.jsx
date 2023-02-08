import React from "react";
import IconButton from "@mui/material/IconButton";
import NoImageIcon from "@mui/icons-material/NoPhotography";
import ImageIcon from "@mui/icons-material/PhotoCamera";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";

const ImageToggle = ({
  downloadImages,
  setDownloadImages,
  exportingActiveRef,
}) => {
  return (
    <Tooltip
      arrow
      placement="left"
      title={`${!downloadImages ? "Not " : ""}Downloading Images`}
      description="Exports can be performed more quickly when not downloading images"
    >
      <IconButton
        disabled={exportingActiveRef.current}
        onClick={() => setDownloadImages(!downloadImages)}
        color={downloadImages ? "primary" : "secondary"}
      >
        {downloadImages ? <ImageIcon /> : <NoImageIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ImageToggle;
