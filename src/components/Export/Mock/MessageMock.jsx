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

const MessageMock = ({ message, index, hideAttachments = false }) => {
  const { selectedGuild } = useSelector(selectGuild);
  const { selectedChannel, channels } = useSelector(selectChannel);
  const { threads } = useSelector(selectThread);
  const { messages } = useSelector(selectMessage);

  const classes = ExportStyles();
  const messageDate = parseISO(message.timestamp, new Date());
  const tz = messageDate
    .toLocaleTimeString(undefined, { timeZoneName: "short" })
    .split(" ")[2];
  const foundThread = threads?.find(
    (thread) => thread.id === message.id || thread.id === message.channel_id
  );
  const repliedToMsg = message.isReply()
    ? messages.find((msg) => msg.id === message.message_reference.message_id)
    : null;

  const showChannelName = selectedGuild.id && !selectedChannel.id;

  return (
    <Stack
      direction="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      id={message.id}
      className={classes.mockStack}
    >
      {repliedToMsg && (
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
              author={repliedToMsg.author}
              reply
            />
            <Typography className={classes.replyMessageName} variant="caption">
              <strong>{repliedToMsg.username}</strong>
            </Typography>
            <Typography className={classes.replyMessageText} variant="caption">
              {hideAttachments ? (
                repliedToMsg.content
              ) : (
                <a href={`#${repliedToMsg.id}`}>{repliedToMsg.content}</a>
              )}
            </Typography>
          </Stack>
        </Stack>
      )}
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
            {showChannelName && (
              <Typography
                variant="caption"
                mt="1px"
                className={classNames(
                  classes.channelName,
                  classes.typographyTitle
                )}
              >
                {
                  channels.find((channel) => channel.id === message.channel_id)
                    ?.name
                }
              </Typography>
            )}
          </Stack>
          {foundThread && (
            <Typography variant="caption" className={classes.typographyHash}>
              {foundThread.name}
            </Typography>
          )}
          <Typography
            className={classes.typographyMessageText}
            variant="body1"
            id={`message-data-${index}`}
          >
            {message.content}
          </Typography>
          {!hideAttachments && (
            <Stack
              mt="5px"
              direction="column"
              justifyContent="flex-start"
              alignItems="center"
              spacing={1}
            >
              {message.attachments.map((attachment) => (
                <AttachmentMock attachment={attachment} />
              ))}
              {message.embeds.map((embed, index) => (
                <EmbedMock embed={embed} index={index} />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
export default MessageMock;
