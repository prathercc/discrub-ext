import React from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import ExportStyles from "../Styles/Export.styles";
import AttachmentStyles from "./Styles/Attachment.styles";
import DownloadIcon from "@mui/icons-material/Download";
import bytes from "bytes";
import { useSelector } from "react-redux";
import { selectExport } from "../../../features/export/exportSlice";

const AttachmentMock = ({ attachment }) => {
  const exportClasses = ExportStyles();
  const classes = AttachmentStyles({
    height: attachment?.height,
    width: attachment?.width,
  });
  const { previewImages, mediaMap } = useSelector(selectExport);
  const isImg = attachment?.isImage?.();
  const isVid = attachment?.isVideo?.();
  const url = attachment.isMedia()
    ? mediaMap[attachment.getMediaUrl()] || attachment.getMediaUrl()
    : attachment.getNonMediaUrl();

  return (
    <Stack direction="column" justifyContent="center" alignItems="flex-start">
      {isImg && previewImages && url && (
        <a target="_blank" rel="noopener noreferrer" href={url}>
          <img className={classes.attachmentImg} src={url} alt="attachment" />
        </a>
      )}
      {previewImages && isVid && (
        <video
          className={classes.video}
          width={attachment.width > 400 ? 400 : attachment.width}
          height={attachment.height > 225 ? 225 : attachment.height}
          src={url}
          controls
          playsinline
          autoPlay={false}
          poster={
            Boolean(mediaMap[attachment.getMediaUrl()]) ? null : "discrub2.png"
          }
        />
      )}
      {((!isVid && !isImg) || !previewImages) && (
        <Stack
          className={classes.altStack}
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
        >
          <a target="_blank" rel="noopener noreferrer" href={url}>
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
              {attachment.filename || url}
            </Typography>
            <Typography
              className={exportClasses.messageAttachmentSize}
              variant="body2"
            >
              {attachment.size ? bytes(attachment.size) : "Unknown Size"}
            </Typography>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
export default AttachmentMock;
