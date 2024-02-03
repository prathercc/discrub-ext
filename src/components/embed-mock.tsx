import AttachmentMock from "./attachment-mock";
import Attachment from "../classes/attachment";
import Embed from "../classes/embed";
import { useExportSlice } from "../features/export/use-export-slice";
import { EmbedType } from "../enum/embed-type";

type EmbedMockProps = {
  embed: Embed;
  index: number;
};

const EmbedMock = ({ embed, index }: EmbedMockProps) => {
  const { type, video, description, thumbnail } = embed;

  const { state: exportState } = useExportSlice();
  const previewImages = exportState.previewImages();
  const mediaMap = exportState.mediaMap();

  const supportedVideoHosts = ["youtube"];
  const videoUrl =
    mediaMap[String(embed.video?.proxy_url)] ||
    embed.video?.proxy_url ||
    undefined;

  const embedWidth = Number(video?.width);
  const embedHeight = Number(video?.height);

  return (
    <>
      {previewImages && type === "gifv" && video && (
        <video
          style={{
            borderRadius: "10px",
            border: "1px solid transparent",
            boxShadow: "4px 5px 13px 0px rgba(0,0,0,0.75)",
          }}
          width={embedWidth > 400 ? 400 : embedWidth}
          height={embedHeight > 225 ? 225 : embedHeight}
          src={videoUrl}
          loop
          controls
          playsInline
          autoPlay={false}
          poster={embed.thumbnail?.proxy_url || "resources/media/discrub2.png"}
        />
      )}
      {previewImages &&
        type === "video" &&
        video &&
        supportedVideoHosts.some((host) =>
          video?.url?.toLowerCase()?.includes(host)
        ) && (
          <iframe
            style={{
              borderRadius: "10px",
              border: "1px solid transparent",
              boxShadow: "4px 5px 13px 0px rgba(0,0,0,0.75)",
            }}
            width="400"
            height="225"
            src={`${video.url}?origin=${window.location.href}`}
            title={description}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        )}
      {previewImages && type === EmbedType.IMAGE && thumbnail && (
        <AttachmentMock
          attachment={
            new Attachment({
              content_type: "image/jpeg",
              filename: String(embed.title),
              height: thumbnail.height,
              id: `EMBEDDED-MEDIA-${index}`,
              size: 0,
              url: thumbnail.url,
              proxy_url: thumbnail.proxy_url || thumbnail.url,
              width: thumbnail.width,
            })
          }
        />
      )}
    </>
  );
};
export default EmbedMock;
