import { Box, Button, Stack, Typography, useTheme } from "@mui/material";
import { getEncodedEmoji, getReactingUsers } from "../../../utils";
import Message from "../../../classes/message";
import ServerEmoji from "../../../components/server-emoji";
import {
  ExportReaction,
  ExportReactionMap,
  ExportUserMap,
} from "../../../features/export/export-types";
import Guild from "../../../classes/guild";
import { MessageType } from "../../../enum/message-type";

type ReactionsProps = {
  message: Message;
  reactionMap: ExportReactionMap;
  userMap: ExportUserMap;
  selectedGuild: Guild | Maybe;
  getLocalAvatar: (x: Snowflake, y: string | Maybe) => string | undefined;
  getLocalEmoji: (x: Snowflake | Maybe) => string | undefined;
};

const Reactions = ({
  message,
  reactionMap,
  userMap,
  selectedGuild,
  getLocalAvatar,
  getLocalEmoji,
}: ReactionsProps) => {
  const theme = useTheme();

  return (
    <Stack
      sx={{
        flexDirection: "row",
        gap: "5px",
        mb: "5px",
        flexWrap: "wrap",
        paddingLeft: message.type === MessageType.CALL ? "40px" : "inherit",
      }}
    >
      {message.reactions?.map((r) => {
        const localPath = getLocalEmoji(r.emoji.id);
        return (
          <Box
            title={r.emoji.id ? `:${r.emoji.name}:` : String(r.emoji.name)}
            component={"a"}
            href={`#${message.id}-${getEncodedEmoji(r.emoji)}`}
            sx={{
              borderRadius: "5px",
              minWidth: "50px",
              minHeight: "25px",
              backgroundColor: "#373a54",
              boxShadow:
                "rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              padding: "1px",
              flexDirection: "row",
              gap: "5px",
              border: "1px solid #7289da",
              textDecoration: "none",
              "& p": {
                cursor: "pointer",
              },
              "& img": {
                cursor: "pointer",
              },
            }}
          >
            {r.emoji.id && localPath ? (
              <ServerEmoji url={localPath} />
            ) : (
              <Typography>{r.emoji.name}</Typography>
            )}
            <Typography sx={{ color: theme.palette.text.secondary }}>
              {r.count}
            </Typography>
          </Box>
        );
      })}
      {message.reactions?.map((r) => {
        const localPath = getLocalEmoji(r.emoji.id);
        const encodedEmoji = getEncodedEmoji(r.emoji);
        const exportReactions: ExportReaction[] = encodedEmoji
          ? reactionMap[message.id][encodedEmoji]
          : [];
        const reactingUsers = getReactingUsers(
          exportReactions,
          userMap,
          selectedGuild
        );

        return (
          <Stack
            id={`${message.id}-${encodedEmoji}`}
            sx={{
              padding: "15px",
              backgroundColor: "background.paper",
              border: `1px solid ${theme.palette.secondary.dark}`,
              borderRadius: "5px",
              display: "none",
              minHeight: 50 + reactingUsers.length * 25,
              maxHeight: 350,
              minWidth: "200px",
              "&:target": {
                display: "flex",
                gap: "5px",
                position: "fixed",
                justifyContent: "flex-start",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              },
            }}
          >
            <Stack
              sx={{
                height: "100%",
                overflowY: "auto",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "5px",
              }}
            >
              {encodedEmoji
                ? exportReactions.map((exportReaction) => {
                    const reactingUser = reactingUsers.find(
                      (rU) => rU.id === exportReaction.id
                    );
                    if (reactingUser) {
                      const avatarUrl = getLocalAvatar(
                        reactingUser.id,
                        reactingUser.avatar
                      );

                      return (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-start",
                            flexDirection: "row",
                            gap: "5px",
                          }}
                        >
                          <img
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                            }}
                            src={avatarUrl}
                            alt="avatar-icon"
                          />
                          <Typography sx={{ color: "text.primary" }}>
                            {reactingUser.displayName}
                          </Typography>
                          <Typography sx={{ color: "text.disabled" }}>
                            {reactingUser.userName}
                          </Typography>
                        </Box>
                      );
                    } else {
                      return null;
                    }
                  })
                : null}
            </Stack>
            <Button
              sx={{ minHeight: "42px", minWidth: "98px" }}
              variant="contained"
              startIcon={
                r.emoji.id && localPath ? (
                  <ServerEmoji url={localPath} />
                ) : (
                  <Typography>{r.emoji.name}</Typography>
                )
              }
              href="#/" // Non-existant target to prevent page scroll when dialog is closed
            >
              Close
            </Button>
          </Stack>
        );
      })}
    </Stack>
  );
};
export default Reactions;
