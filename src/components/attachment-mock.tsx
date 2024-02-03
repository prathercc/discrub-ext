import { IconButton, Stack, Typography, useTheme } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import bytes from "bytes";
import { useExportSlice } from "../features/export/use-export-slice";
import Attachment from "../classes/attachment";
import MuiImg from "../common-components/mui-img/mui-img";
import {
  attachmentIsImage,
  attachmentIsVideo,
  entityContainsMedia,
} from "../utils";

type AttachmentMockProps = {
  attachment: Attachment;
};

const AttachmentMock = ({ attachment }: AttachmentMockProps) => {
  const theme = useTheme();

  const { state: exportState } = useExportSlice();
  const mediaMap = exportState.mediaMap();
  const previewImages = exportState.previewImages();

  const isImg = attachmentIsImage(attachment);
  const isVid = attachmentIsVideo(attachment);

  const url = entityContainsMedia(attachment)
    ? mediaMap[attachment.proxy_url] || attachment.proxy_url
    : attachment.url;

  const attachmentWidth = Number(attachment.width);
  const attachmentHeight = Number(attachment.height);

  return (
    <Stack direction="column" justifyContent="center" alignItems="flex-start">
      {isImg && previewImages && url && (
        <a target="_blank" rel="noopener noreferrer" href={url}>
          <MuiImg
            props={{
              src: url,
              alt: "attachment",
            }}
            sx={{
              width: attachmentWidth < 100 ? attachmentWidth : 100,
              height: attachmentHeight < 100 ? attachmentHeight : 100,
              transition: "all ease-in-out .5s",
              borderRadius: "5px",
              cursor: "pointer",
              boxShadow: "4px 5px 6px 0px rgba(0,0,0,0.75)",
              "&:hover": {
                width: attachmentWidth > 400 ? 400 : attachmentWidth,
                height: attachmentHeight > 400 ? 400 : attachmentHeight,
              },
            }}
          />
        </a>
      )}
      {previewImages && isVid && (
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
          poster={
            mediaMap[attachment.proxy_url]
              ? undefined
              : "resources/media/discrub.png"
          }
        />
      )}
      {((!isVid && !isImg) || !previewImages) && (
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
