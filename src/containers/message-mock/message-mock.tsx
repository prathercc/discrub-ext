import { Stack, Typography, useTheme } from "@mui/material";
import { format, parseISO } from "date-fns";
import {
  getTimeZone,
  resolveAvatarUrl,
  resolveEmojiUrl,
  resolveRoleUrl,
  stringToBool,
} from "../../utils";
import { useGuildSlice } from "../../features/guild/use-guild-slice";
import { useChannelSlice } from "../../features/channel/use-channel-slice";
import { useThreadSlice } from "../../features/thread/use-thread-slice";
import { useMessageSlice } from "../../features/message/use-message-slice";
import { useExportSlice } from "../../features/export/use-export-slice";
import { useUserSlice } from "../../features/user/use-user-slice";
import Message from "../../classes/message";
import AuthorAvatar from "../../components/author-avatar";
import { MessageType } from "../../enum/message-type";
import { useAppSlice } from "../../features/app/use-app-slice";
import AuthorName from "./components/author-name";
import MessageContent from "./components/message-content";
import RepliedToContent from "./components/replied-to-content";
import ChannelName from "./components/channel-name";
import ThreadName from "./components/thread-name";
import Attachments from "./components/attachments";
import WebhookEmbeds from "./components/webhook-embeds";
import ChainedDate from "./components/chained-date";
import Reactions from "./components/reactions";
import CallMessage from "./components/call-message";
import Date from "./components/date";

type MessageMockProps = {
  message: Message;
  index: number | string;
  browserView?: boolean;
  isChained?: boolean;
};

const MessageMock = ({
  message,
  index,
  browserView = false,
  isChained = false,
}: MessageMockProps) => {
  const theme = useTheme();

  const { state: appState } = useAppSlice();
  const settings = appState.settings();

  const { state: guildState } = useGuildSlice();
  const selectedGuild = guildState.selectedGuild();

  const { state: channelState } = useChannelSlice();
  const selectedChannel = channelState.selectedChannel();
  const channels = channelState.channels();

  const { state: threadState } = useThreadSlice();
  const threads = threadState.threads();

  const { state: messageState } = useMessageSlice();
  const messages = messageState.messages();

  const { state: userState } = useUserSlice();
  const currentUser = userState.currentUser();

  const { state: exportState, getFormattedInnerHtml } = useExportSlice();
  const userMap = exportState.userMap();
  const roleMap = exportState.roleMap();
  const emojiMap = exportState.emojiMap();
  const reactionMap = exportState.reactionMap();
  const avatarMap = exportState.avatarMap();

  const isCall = message.type === MessageType.CALL;

  const messageDate = parseISO(message.timestamp);
  const tz = getTimeZone(messageDate);
  const shortDateTime = `${format(messageDate, "MM/dd/yyyy")} ${
    isCall ? "" : "at"
  } ${format(messageDate, "HH:mm:ss")} ${tz}`;
  const longDateTime = `${format(
    messageDate,
    "EEEE, LLLL d, yyyy HH:mm:ss"
  )} ${tz}`;

  const foundThread = threads?.find(
    (thread) => thread.id === message.id || thread.id === message.channel_id
  );
  const repliedToMsg =
    message.type === MessageType.REPLY
      ? messages.find((msg) => msg.id === message.message_reference?.message_id)
      : null;

  const showChannelName = selectedGuild?.id && !selectedChannel?.id;

  const getRawHtml = (content: string, isReply: boolean = false) => {
    return getFormattedInnerHtml({
      content,
      isReply,
      exportView: !browserView,
      message,
    });
  };

  const getLocalAvatar = (userId: Snowflake, avatar: string | Maybe) => {
    return resolveAvatarUrl(userId, avatar, avatarMap).local;
  };

  const getLocalEmoji = (id: Snowflake | Maybe) => {
    return resolveEmojiUrl(id, emojiMap).local;
  };

  const getRolePath = (id: Snowflake, icon: string | Maybe) => {
    return resolveRoleUrl(id, icon, roleMap);
  };

  return (
    <Stack
      direction="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      id={message.id}
      sx={{
        width: "calc(100% - 10px)",
        "&:hover": {
          backgroundColor: !browserView ? "#2e2f35" : undefined,
          "& span": { opacity: "1 !important" },
        },
        margin: isChained ? "0px 0px 0px !important" : undefined,
        "&:target": {
          background: "rgb(92, 107, 192, 0.25)",
          padding: "5px",
          width: "calc(100% - 10px)",
        },
      }}
    >
      {repliedToMsg && (
        <RepliedToContent
          browserView={browserView}
          message={repliedToMsg}
          selectedGuild={selectedGuild}
          userMap={userMap}
          id={`reply-data-${index}`}
          rawHtml={getRawHtml(repliedToMsg.content, true)}
          getRolePath={getRolePath}
        />
      )}
      <Stack
        direction="row"
        alignItems={isCall && browserView ? "center" : "flex-start"}
        justifyContent="flex-start"
        spacing={1}
        sx={{
          paddingLeft: !browserView ? "8px" : undefined,
          maxWidth: "100vw",
          wordBreak: "break-all",
          minHeight: isChained ? 0 : "50px",
        }}
      >
        {!isChained && !isCall && (
          <AuthorAvatar browserView={browserView} message={message} />
        )}
        {isChained && (
          <ChainedDate message={message} longDateTime={longDateTime} />
        )}
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
            <Typography
              sx={{
                display: "flex",
                gap: "5px",
                "& a": {
                  display: "flex",
                  gap: "5px",
                },
                color: theme.palette.text.primary,
              }}
              variant="body2"
            >
              {!isChained && !isCall && (
                <AuthorName
                  msg={message}
                  userMap={userMap}
                  selectedGuild={selectedGuild}
                  getRolePath={getRolePath}
                />
              )}
            </Typography>
            {!isChained && !isCall && (
              <>
                <Date
                  longDateTime={longDateTime}
                  shortDateTime={shortDateTime}
                />
                {showChannelName && (
                  <ChannelName channels={channels} message={message} />
                )}
              </>
            )}
          </Stack>
          {!isChained && foundThread && <ThreadName thread={foundThread} />}
          <MessageContent
            id={`message-data-${index}`}
            rawHtml={getRawHtml(message.content)}
          />
          {isCall && (
            <CallMessage
              call={message.call}
              currentUser={currentUser}
              msg={message}
              selectedGuild={selectedGuild}
              userMap={userMap}
              longDateTime={longDateTime}
              shortDateTime={shortDateTime}
              getRolePath={getRolePath}
            />
          )}
          {!browserView && <Attachments message={message} />}
          {!browserView && <WebhookEmbeds message={message} />}
          {!browserView && stringToBool(settings.reactionsEnabled) && (
            <Reactions
              message={message}
              reactionMap={reactionMap}
              selectedGuild={selectedGuild}
              userMap={userMap}
              getLocalAvatar={getLocalAvatar}
              getLocalEmoji={getLocalEmoji}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
export default MessageMock;
