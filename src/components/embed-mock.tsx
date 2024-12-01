import Embed from "../classes/embed";
import { useExportSlice } from "../features/export/use-export-slice";
import { EmbedType } from "../enum/embed-type";
import { useAppSlice } from "../features/app/use-app-slice";
import { stringToTypedArray } from "../utils";
import { MediaType } from "../enum/media-type";
import VideoMock from "./video-mock.tsx";
import RemoteVideoMock from "./remote-video.tsx";
import ImageMock from "./image-mock.tsx";

type EmbedMockProps = {
  embed: Embed;
  index: number;
};

const EmbedMock = ({ embed }: EmbedMockProps) => {
  const { type, video, description, thumbnail } = embed;

  const { state: appState } = useAppSlice();
  const settings = appState.settings();
  const { state: exportState } = useExportSlice();
  const previewMedia = stringToTypedArray<MediaType>(
    settings.exportPreviewMedia_2,
  );
  const isPreviewingImages = previewMedia.some(
    (mt) => mt === MediaType.EMBEDDED_IMAGES,
  );
  const isPreviewingVideos = previewMedia.some(
    (mt) => mt === MediaType.EMBEDDED_VIDEOS,
  );
  const resMode = settings.exportImageResMode;
  const mediaMap = exportState.mediaMap();

  const videoUrl =
    mediaMap[String(embed.video?.proxy_url)] ||
    embed.video?.proxy_url ||
    embed.video?.url ||
    undefined;
  const imageUrl =
    mediaMap[String(thumbnail?.proxy_url)] ||
    thumbnail?.proxy_url ||
    thumbnail?.url;

  const embedWidth = Number(video?.width);
  const embedHeight = Number(video?.height);

  return (
    <>
      {isPreviewingVideos && type === EmbedType.GIFV && video && (
        <VideoMock
          url={videoUrl}
          width={embedWidth}
          height={embedHeight}
          loop
        />
      )}
      {isPreviewingVideos &&
        type === EmbedType.VIDEO &&
        video &&
        (video.proxy_url ? (
          <VideoMock url={videoUrl} width={embedWidth} height={embedHeight} />
        ) : (
          <RemoteVideoMock url={videoUrl} description={description} />
        ))}
      {isPreviewingImages &&
        [EmbedType.IMAGE, EmbedType.ARTICLE].some((t) => t === type) &&
        thumbnail && (
          <ImageMock
            url={imageUrl}
            width={Number(thumbnail.width)}
            height={Number(thumbnail.height)}
            resMode={resMode}
          />
        )}
    </>
  );
};
export default EmbedMock;
