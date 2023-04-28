import React, { useContext } from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import ExportMessagesStyles from "../ExportMessages.styles";
import AttachmentStyles from "./Attachment.styles";
import DownloadIcon from "@mui/icons-material/Download";
import bytes from "bytes";
import { ExportContext } from "../../../../context/export/ExportContext";

const AttachmentMock = ({ attachment }) => {
  const exportClasses = ExportMessagesStyles();
  const classes = AttachmentStyles({
    height: attachment?.height,
    width: attachment?.width,
  });
  const { state: exportState } = useContext(ExportContext);
  const { previewImages } = exportState;
  const supportedImgTypes = ["png", "jpg", "jpeg", "gif"];
  const isImg =
    attachment.content_type?.includes("image") ||
    supportedImgTypes.some((sit) => attachment.filename.includes(sit));

  return (
    <Stack direction="column" justifyContent="center" alignItems="flex-start">
      {isImg && previewImages && (attachment.local_url || attachment.url) ? (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={attachment.local_url || attachment.url}
        >
          <img
            className={classes.attachmentImg}
            src={attachment.local_url || attachment.url}
            alt="attachment"
          />
        </a>
      ) : (
        <Stack
          className={classes.altStack}
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
        >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={attachment.local_url || attachment.url}
          >
            <IconButton>
              <DownloadIcon className={exportClasses.typographyHash} />
            </IconButton>
          </a>

          <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
          >
            <Typography
              className={exportClasses.typographyHash}
              variant="body2"
            >
              {attachment.filename}
            </Typography>
            <Typography
              className={exportClasses.messageAttachmentSize}
              variant="body2"
            >
              {bytes(attachment.size)}
            </Typography>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
export default AttachmentMock;
