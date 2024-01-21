import { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Alert, IconButton, Snackbar } from "@mui/material";
import Tooltip from "../common-components/tooltip/tooltip";
import copy from "copy-to-clipboard";

type CopyAdornmentProps = {
  copyValue: string;
  copyName: string;
  disabled?: boolean;
};

function CopyAdornment({
  copyValue,
  copyName,
  disabled = false,
}: CopyAdornmentProps) {
  const [textCopied, setTextCopied] = useState(false);
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
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
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
        open={textCopied}
        onClose={() => {
          setTextCopied(false);
        }}
      >
        <Alert variant="filled" severity="info">
          <span>{copyName} copied</span>
        </Alert>
      </Snackbar>
    </>
  );
}

export default CopyAdornment;
