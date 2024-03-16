import { Stack, Typography, useTheme } from "@mui/material";
import { User } from "../../../classes/user";
import { MessageCallObject } from "../../../types/message-call-object";
import AuthorName, { AuthorNameProps } from "./author-name";
import { formatDuration, intervalToDuration, parseISO } from "date-fns";
import PhoneIcon from "@mui/icons-material/Phone";
import Date, { DateProps } from "./date";

type CallMessageProps = {
  currentUser: User | Maybe;
  call: MessageCallObject | Maybe;
} & AuthorNameProps &
  DateProps;

const CallMessage = ({
  currentUser,
  call,
  msg,
  roleMap,
  userMap,
  selectedGuild,
  longDateTime,
  shortDateTime,
}: CallMessageProps) => {
  const theme = useTheme();
  const { timestamp } = msg;
  const { participants, ended_timestamp } = call || { participants: [] };
  const { id } = currentUser || { id: null };
  const answered = participants.some((pId) => pId === id);
  let duration = null;
  if (timestamp && ended_timestamp) {
    const rawDuration = intervalToDuration({
      start: parseISO(timestamp),
      end: parseISO(ended_timestamp),
    });
    duration = formatDuration(rawDuration, {
      format: ["hours", "minutes", "seconds"],
    });
  }
  return (
    <Stack
      sx={{
        flexDirection: "row",
        alignItems: "center",
        gap: "5px",
        flexWrap: "wrap",
      }}
    >
      <PhoneIcon
        sx={{
          color: answered
            ? theme.palette.success.main
            : theme.palette.text.disabled,
        }}
      />
      <Typography style={{ color: theme.palette.text.disabled }}>
        {answered ? "" : "You missed a call from "}
      </Typography>
      <Typography sx={{ color: theme.palette.text.primary }}>
        <AuthorName
          msg={msg}
          roleMap={roleMap}
          userMap={userMap}
          selectedGuild={selectedGuild}
        />
      </Typography>
      <Typography style={{ color: theme.palette.text.disabled }}>
        {answered
          ? ` started a call that lasted ${duration}.`
          : ` that lasted ${duration}.`}
      </Typography>
      <Date longDateTime={longDateTime} shortDateTime={shortDateTime} />
    </Stack>
  );
};
export default CallMessage;
