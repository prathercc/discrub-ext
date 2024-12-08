type RemoteVideoMockProps = {
  url: string | undefined;
  description: string | undefined;
};

const RemoteVideoMock = ({ url, description }: RemoteVideoMockProps) => {
  return (
    <>
      {url && (
        <iframe
          style={{
            borderRadius: "10px",
            border: "1px solid transparent",
            boxShadow: "4px 5px 13px 0px rgba(0,0,0,0.75)",
          }}
          width="400"
          height="225"
          src={`${url}?origin=${window.location.href}`}
          title={description}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      )}
    </>
  );
};
export default RemoteVideoMock;
