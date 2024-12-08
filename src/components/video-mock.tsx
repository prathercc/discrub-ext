type VideoMockProps = {
  url: string | undefined;
  width: number;
  height: number;
  loop?: boolean;
};

const VideoMock = ({ url, width, height, loop = false }: VideoMockProps) => {
  return (
    <>
      {url && (
        <video
          style={{
            borderRadius: "10px",
            border: "1px solid transparent",
            boxShadow: "4px 5px 13px 0px rgba(0,0,0,0.75)",
          }}
          width={width > 400 ? 400 : width}
          height={height > 225 ? 225 : height}
          src={url}
          loop={loop}
          controls
          playsInline
          autoPlay={false}
          poster="../discrub_media/discrub.png" // Required to prevent 'react-to-print' from hanging indefinitely in some cases.
        />
      )}
    </>
  );
};
export default VideoMock;
