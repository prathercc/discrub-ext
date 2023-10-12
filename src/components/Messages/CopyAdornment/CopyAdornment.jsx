import React, { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { IconButton, Snackbar } from "@mui/material";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import copy from "copy-to-clipboard";

function CopyAdornment({ copyValue, copyName, disabled }) {
  const [textCopied, setTextCopied] = useState(false);
  const handleClick = (e) => {
    e.stopPropagation();
    copy(copyValue);
    setTextCopied(true);
  };

  return (
    <>
      <Tooltip title={`Copy ${copyName}`}>
        <IconButton disabled={disabled} onClick={handleClick} color="secondary">
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={5000}
        open={textCopied}
        onClose={() => {
          setTextCopied(false);
        }}
        message={<span>{copyName} copied</span>}
      />
    </>
  );
}

export default CopyAdornment;
