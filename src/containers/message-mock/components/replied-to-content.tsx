import { Stack, Typography } from "@mui/material";
import AuthorAvatar from "../../../components/author-avatar";
import AuthorName from "./author-name";
import MessageContent from "./message-content";
import Message from "../../../classes/message";
import { ExportUserMap } from "../../../features/export/export-types";
import Guild from "../../../classes/guild";
import { ResolvedFilePathObject } from "../../../utils";

type RepliedToContentProps = {
  browserView: boolean;
  message: Message;
  userMap: ExportUserMap;
  selectedGuild: Guild | Maybe;
  id: string;
  rawHtml: string;
  getRolePath: (x: Snowflake, y: string | Maybe) => ResolvedFilePathObject;
};

const RepliedToContent = ({
  browserView,
  message,
  userMap,
  selectedGuild,
  id,
  rawHtml,
  getRolePath,
}: RepliedToContentProps) => {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="flex-start"
      spacing={1}
    >
      <div
        style={{
          marginLeft: 20,
          marginTop: 8,
          height: 7,
          width: 17,
          borderLeft: "2px solid #4e5058",
          borderTop: "2px solid #4e5058",
          borderTopLeftRadius: "5px",
        }}
      />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        spacing={1}
        sx={{ maxWidth: 600 }}
      >
        <AuthorAvatar browserView={browserView} message={message} isReply />
        <Typography
          sx={{
            display: "flex",
            gap: "5px",
            "& a": {
              display: "flex",
              gap: "5px",
              color: "inherit",
              textDecoration: "inherit",
            },
            "& span": {
              color: "#FFF !important",
            },
            color: "#a0a1a4",
            whiteSpace: "nowrap",
          }}
          variant="caption"
        >
          {browserView ? (
            <AuthorName
              msg={message}
              getRolePath={getRolePath}
              userMap={userMap}
              selectedGuild={selectedGuild}
            />
          ) : (
            <a href={`#${message.id}`}>
              <AuthorName
                msg={message}
                getRolePath={getRolePath}
                userMap={userMap}
                selectedGuild={selectedGuild}
              />
            </a>
          )}
        </Typography>
        <MessageContent id={id} isReply={true} rawHtml={rawHtml} />
      </Stack>
    </Stack>
  );
};
export default RepliedToContent;
