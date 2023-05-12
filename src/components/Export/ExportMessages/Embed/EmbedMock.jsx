import React, { useContext } from "react";
import { ExportContext } from "../../../../context/export/ExportContext";
import AttachmentStyles from "../Attachment/Attachment.styles";
import AttachmentMock from "../Attachment/AttachmentMock";

const EmbedMock = ({ embed, index }) => {
  const { type, video, local_url, description } = embed;
  const attachmentClasses = AttachmentStyles();
  const { state: exportState } = useContext(ExportContext);
  const { previewImages } = exportState;
  const supportedVideoHosts = ["youtube"];

  return (
    <>
      {previewImages && type === "gifv" && (
        <video
          className={attachmentClasses.video}
          width={video.width > 400 ? 400 : video.width}
          height={video.height > 225 ? 225 : video.height}
          src={local_url || video.url}
          loop
          controls
          playsinline
          autoPlay={false}
        />
      )}
      {previewImages &&
        type === "video" &&
        supportedVideoHosts.some((host) =>
          video?.url?.toLowerCase()?.includes(host)
        ) && (
          <iframe
            className={attachmentClasses.video}
            title={description}
            width={400}
            height={225}
            src={`${video.url}`}
            referrerpolicy="strict-origin-when-cross-origin"
          />
        )}
      {previewImages && type === "image" && (
        <AttachmentMock
          attachment={{
            content_type: "image/jpeg",
            filename: null,
            height: embed.thumbnail.height,
            id: `EMBEDDED-MEDIA-${index}`,
            proxy_url: embed.thumbnail.proxy_url,
            size: null,
            url: embed.thumbnail.url,
            width: embed.thumbnail.width,
            local_url: embed.local_url,
          }}
        />
      )}
    </>
  );
};
export default EmbedMock;
