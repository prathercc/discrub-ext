type ServerEmojiProps = {
  url: string;
};
const ServerEmoji = ({ url }: ServerEmojiProps) => {
  return <img style={{ width: "24px", height: "24px" }} src={url} />;
};

export default ServerEmoji;
