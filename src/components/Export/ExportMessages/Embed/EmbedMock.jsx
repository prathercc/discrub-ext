import React, { useContext } from "react";
import { ExportContext } from "../../../../context/export/ExportContext";
import AttachmentStyles from "../Attachment/Attachment.styles";
import AttachmentMock from "../Attachment/AttachmentMock";

const EmbedMock = ({ embed, index }) => {
  const { type, video, local_url, description, thumbnail } = embed;
  const attachmentClasses = AttachmentStyles();
  const { state: exportState } = useContext(ExportContext);
  const { previewImages } = exportState;
  const supportedVideoHosts = ["youtube"];

  return (
    <>
      {previewImages && type === "gifv" && video && (
        <video
          className={attachmentClasses.video}
          width={video.width > 400 ? 400 : video.width}
          height={video.height > 225 ? 225 : video.height}
          src={local_url || video.url}
          loop
          controls
          playsinline
          autoPlay={false}
          poster={thumbnail?.proxy_url || thumbnail?.url || "discrub2.png"}
        />
      )}
      {previewImages &&
        type === "video" &&
        video &&
        supportedVideoHosts.some((host) =>
          video?.url?.toLowerCase()?.includes(host)
        ) && (
          <iframe
            className={attachmentClasses.video}
            width="400"
            height="225"
            src={`${video.url}?origin=${window.location.href}`}
            title={description}
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        )}
      {previewImages && type === "image" && thumbnail && (
        <AttachmentMock
          attachment={{
            content_type: "image/jpeg",
            filename: null,
            height: thumbnail.height,
            id: `EMBEDDED-MEDIA-${index}`,
            proxy_url: thumbnail.proxy_url,
            size: null,
            url: thumbnail.url,
            width: thumbnail.width,
            local_url: embed.local_url,
          }}
        />
      )}
    </>
  );
};
export default EmbedMock;
