import { IconButton, Stack, Typography, useTheme } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import bytes from "bytes";
import { useExportSlice } from "../features/export/use-export-slice";
import Attachment from "../classes/attachment";
import {
  entityContainsMedia,
  entityIsAudio,
  entityIsImage,
  entityIsVideo,
  stringToTypedArray,
} from "../utils";
import { useAppSlice } from "../features/app/use-app-slice";
import { MediaType } from "../enum/media-type";
import VideoMock from "./video-mock.tsx";
import ImageMock from "./image-mock.tsx";

type AttachmentMockProps = {
  attachment: Attachment;
};

const AttachmentMock = ({ attachment }: AttachmentMockProps) => {
  const theme = useTheme();

  const { state: appState } = useAppSlice();
  const settings = appState.settings();
  const { state: exportState } = useExportSlice();
  const mediaMap = exportState.mediaMap();
  const previewMedia = stringToTypedArray<MediaType>(
    settings.exportPreviewMedia_2,
  );
  const isPreviewingImages = previewMedia.some((mt) => mt === MediaType.IMAGES);
  const isPreviewingVideos = previewMedia.some((mt) => mt === MediaType.VIDEOS);
  const isPreviewingAudio = previewMedia.some((mt) => mt === MediaType.AUDIO);
  const resMode = settings.exportImageResMode;

  const isImg = entityIsImage(attachment);
  const isVid = entityIsVideo(attachment);
  const isAudio = entityIsAudio(attachment);

  const shouldPreventPreview =
    !entityContainsMedia(attachment) ||
    (isImg && !isPreviewingImages) ||
    (isVid && !isPreviewingVideos) ||
    (isAudio && !isPreviewingAudio);

  const url = entityContainsMedia(attachment)
    ? mediaMap[attachment.proxy_url] || attachment.proxy_url
    : attachment.url;

  const attachmentWidth = Number(attachment.width);
  const attachmentHeight = Number(attachment.height);

  return (
    <Stack direction="column" justifyContent="center" alignItems="flex-start">
      {isImg && isPreviewingImages && (
        <ImageMock
          url={url}
          width={attachmentWidth}
          height={attachmentHeight}
          resMode={resMode}
        />
      )}
      {isPreviewingVideos && isVid && (
        <VideoMock
          url={url}
          width={attachmentWidth}
          height={attachmentHeight}
        />
      )}
      {isPreviewingAudio && isAudio && (
        <audio controls>
          <source src={url} />
        </audio>
      )}
      {shouldPreventPreview && (
        <Stack
          sx={{
            backgroundColor: theme.palette.background.paper,
            padding: "5px",
            borderRadius: "5px",
            minWidth: "181px",
            maxWidth: "400px",
          }}
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
        >
          <a target="_blank" rel="noopener noreferrer" href={url}>
            <IconButton>
              <DownloadIcon sx={{ color: theme.palette.text.disabled }} />
            </IconButton>
          </a>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
          >
            <Typography
              sx={{ color: theme.palette.text.disabled }}
              variant="body2"
            >
              {attachment.filename || url}
            </Typography>
            <Typography
              sx={{ color: theme.palette.text.disabled }}
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
