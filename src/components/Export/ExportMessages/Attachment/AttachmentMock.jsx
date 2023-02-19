import React from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import ExportMessagesStyles from "../ExportMessages.styles";
import DownloadIcon from "@mui/icons-material/Download";
import bytes from "bytes";
import AttachmentFilePreview from "./AttachmentFilePreview";

const AttachmentMock = ({ attachment }) => {
  const classes = ExportMessagesStyles();
  return (
    <Stack
      className={classes.messageAttachmentStack}
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={1}
    >
      <AttachmentFilePreview attachment={attachment} />
      <Typography className={classes.typographyHash} variant="body2">
        {attachment.filename}
      </Typography>
      <Typography className={classes.messageAttachmentSize} variant="body2">
        {bytes(attachment.size)}
      </Typography>
      <a href={attachment.local_url || attachment.url}>
        <IconButton>
          <DownloadIcon className={classes.typographyHash} />
        </IconButton>
      </a>
    </Stack>
  );
};
export default AttachmentMock;
