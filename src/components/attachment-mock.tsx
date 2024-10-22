import {
  IconButton,
  Stack,
  SxProps,
  Typography,
  useTheme,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import bytes from "bytes";
import { useExportSlice } from "../features/export/use-export-slice";
import Attachment from "../classes/attachment";
import MuiImg from "../common-components/mui-img/mui-img";
import {
  entityContainsMedia,
  entityIsAudio,
  entityIsImage,
  entityIsVideo,
  stringToTypedArray,
} from "../utils";
import { useAppSlice } from "../features/app/use-app-slice";
import { ResolutionType } from "../enum/resolution-type";
import { MediaType } from "../enum/media-type";

type AttachmentMockProps = {
  attachment: Attachment;
};

export const getMediaResProps = (
  resMode: string,
  fullWidth: number,
  fullHeight: number
): SxProps => {
  const thumbnailWidth = 100;
  const thumbnailHeight = 100;
  const safeWidth = 400;
  const safeHeight = 400;

  const thumbnailProps = {
    width: fullWidth < thumbnailWidth ? fullWidth : thumbnailWidth,
    height: fullHeight < thumbnailHeight ? fullHeight : thumbnailHeight,
  };
  const fullProps = { width: fullWidth, height: fullHeight };
  const safeProps = {
    width: fullWidth > safeWidth ? safeWidth : fullWidth,
    height: fullHeight > safeHeight ? safeHeight : fullHeight,
  };

  switch (resMode) {
    case ResolutionType.HOVER_LIMITED:
      return {
        ...thumbnailProps,
        "&:hover": {
          ...safeProps,
        },
      };
    case ResolutionType.HOVER_FULL:
      return {
        ...thumbnailProps,
        "&:hover": {
          ...fullProps,
        },
      };
    case ResolutionType.NO_HOVER_FULL:
      return {
        ...fullProps,
      };
    case ResolutionType.NO_HOVER_LIMITED:
      return {
        ...safeProps,
      };
    default:
      return {};
  }
};

const AttachmentMock = ({ attachment }: AttachmentMockProps) => {
  const theme = useTheme();

  const { state: appState } = useAppSlice();
  const settings = appState.settings();
  const { state: exportState } = useExportSlice();
  const mediaMap = exportState.mediaMap();
  const previewMedia = stringToTypedArray<MediaType>(
    settings.exportPreviewMedia_2
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
      {isImg && isPreviewingImages && url && (
        <a target="_blank" rel="noopener noreferrer" href={url}>
          <MuiImg
            props={{
              src: url,
              alt: "attachment",
            }}
            sx={{
              transition: "all ease-in-out .5s",
              borderRadius: "5px",
              cursor: "pointer",
              boxShadow: "4px 5px 6px 0px rgba(0,0,0,0.75)",
              ...getMediaResProps(resMode, attachmentWidth, attachmentHeight),
            }}
          />
        </a>
      )}
      {isPreviewingVideos && isVid && (
        <video
          style={{
            borderRadius: "10px",
            border: "1px solid transparent",
            boxShadow: "4px 5px 13px 0px rgba(0,0,0,0.75)",
          }}
          width={attachmentWidth > 400 ? 400 : attachmentWidth}
          height={attachmentHeight > 225 ? 225 : attachmentHeight}
          src={url}
          controls
          playsInline
          autoPlay={false}
          poster="../discrub_media/discrub.png" // Required to prevent 'react-to-print' from hanging indefinitely in some cases.
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
