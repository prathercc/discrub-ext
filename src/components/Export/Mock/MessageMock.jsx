import React from "react";
import { Stack, Typography } from "@mui/material";
import ExportStyles from "../Styles/Export.styles";
import AttachmentMock from "./AttachmentMock";
import AuthorAvatar from "./AuthorAvatar";
import EmbedMock from "./EmbedMock";
import classNames from "classnames";
import { format, parseISO } from "date-fns";
import { selectChannel } from "../../../features/channel/channelSlice";
import { useSelector } from "react-redux";
import { selectGuild } from "../../../features/guild/guildSlice";
import { selectMessage } from "../../../features/message/messageSlice";
import { selectThread } from "../../../features/thread/threadSlice";
import { renderToString } from "react-dom/server";
import MessageMockStyles from "./Styles/MessageMock.styles";
import {
  getEmojiReferences,
  selectExport,
} from "../../../features/export/exportSlice";

const MessageMock = ({ message, index, hideAttachments = false }) => {
  const { selectedGuild } = useSelector(selectGuild);
  const { selectedChannel, channels } = useSelector(selectChannel);
  const { threads } = useSelector(selectThread);
  const { messages } = useSelector(selectMessage);
  const { emojiMap } = useSelector(selectExport);

  const classes = ExportStyles();
  const messageMockClasses = MessageMockStyles();
  const messageDate = parseISO(message.timestamp, new Date());
  const tz = getTimeZone(messageDate);
  const foundThread = threads?.find(
    (thread) => thread.id === message.id || thread.id === message.channel_id
  );
  const repliedToMsg = message.isReply()
    ? messages.find((msg) => msg.id === message.message_reference.message_id)
    : null;

  const showChannelName = selectedGuild.id && !selectedChannel.id;

  const getEmoji = (
    { name: parsedEmojiName, id: parsedEmojiId },
    smallEmoji
  ) => {
    let emojiUrl = `https://cdn.discordapp.com/emojis/${parsedEmojiId}`;
    if (emojiMap && emojiMap[parsedEmojiId] && !hideAttachments) {
      emojiUrl = `../${emojiMap[parsedEmojiId]}`;
    }

    return (
      <span className={messageMockClasses.emojiBox}>
        <img
          id={parsedEmojiName}
          src={`${emojiUrl}`}
          alt={parsedEmojiName}
          className={classNames({
            [messageMockClasses.emojiImgDefault]: !smallEmoji,
            [messageMockClasses.emojiImgSmall]: smallEmoji,
          })}
        />
        {!smallEmoji && (
          <span className={messageMockClasses.emojiTooltip}>
            {parsedEmojiName}
          </span>
        )}
      </span>
    );
  };

  const getMessageContent = (content, id, smallEmoji = false) => {
    const emojiReferences = getEmojiReferences(content);
    let rawHtml = content;
    if (emojiReferences.length) {
      emojiReferences.forEach((emojiRef) => {
        rawHtml = rawHtml.replaceAll(
          emojiRef.raw,
          renderToString(getEmoji(emojiRef, smallEmoji))
        );
      });
    }

    return (
      <Typography
        id={id}
        variant={smallEmoji ? "caption" : "body1"}
        className={classNames({
          [classes.typographyMessageText]: !smallEmoji,
          [classes.replyMessageText]: smallEmoji,
        })}
        sx={{
          display: "flex",
          gap: "5px",
        }}
        dangerouslySetInnerHTML={{ __html: rawHtml }}
      />
    );
  };

  const getRepliedToContent = () => {
    return (
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="flex-start"
        spacing={1}
      >
        <div className={classes.replyDiv} />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          spacing={1}
          sx={{ maxWidth: 600 }}
        >
          <AuthorAvatar
            hideAttachments={hideAttachments}
            message={repliedToMsg}
            reply
          />
          <Typography className={classes.replyMessageName} variant="caption">
            {hideAttachments ? (
              <strong>{repliedToMsg.username}</strong>
            ) : (
              <a href={`#${repliedToMsg.id}`}>
                <strong>{repliedToMsg.username}</strong>
              </a>
            )}
          </Typography>
          {getMessageContent(repliedToMsg.content, `reply-data-${index}`, true)}
        </Stack>
      </Stack>
    );
  };

  const getChannelName = () => {
    return (
      <Typography
        variant="caption"
        mt="1px"
        className={classNames(classes.channelName, classes.typographyTitle)}
      >
        {channels.find((channel) => channel.id === message.channel_id)?.name}
      </Typography>
    );
  };

  const getThread = () => {
    return (
      <Typography variant="caption" className={classes.typographyHash}>
        {foundThread.name}
      </Typography>
    );
  };

  const getAttachments = () => {
    return (
      <Stack
        mt="5px"
        direction="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={1}
      >
        {message.attachments.map((attachment) => (
          <AttachmentMock attachment={attachment} />
        ))}
        {message.embeds.map((embed, index) => (
          <EmbedMock embed={embed} index={index} />
        ))}
      </Stack>
    );
  };

  return (
    <Stack
      direction="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      id={message.id}
      className={classes.mockStack}
    >
      {repliedToMsg && getRepliedToContent()}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="flex-start"
        spacing={1}
        className={classes.messageMockMainStack}
      >
        <AuthorAvatar
          hideAttachments={hideAttachments}
          author={message.author}
        />
        <Stack
          direction="column"
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
          >
            <Typography className={classes.typographyTitle} variant="body2">
              <strong>{message.username}</strong>
            </Typography>
            <Typography
              mt="1px"
              className={classes.typographyHash}
              variant="caption"
            >
              {`${format(messageDate, "MM/dd/yyyy")} at ${format(
                messageDate,
                "HH:mm:ss"
              )} ${tz}`}
            </Typography>
            {showChannelName && getChannelName()}
          </Stack>
          {foundThread && getThread()}
          {getMessageContent(message.content, `message-data-${index}`)}
          {!hideAttachments && getAttachments()}
        </Stack>
      </Stack>
    </Stack>
  );
};
export default MessageMock;
