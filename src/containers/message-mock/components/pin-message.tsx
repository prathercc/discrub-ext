import { Stack, Typography, useTheme } from "@mui/material";
import AuthorName, { AuthorNameProps } from "./author-name";
import PushPinIcon from "@mui/icons-material/PushPin";
import Date, { DateProps } from "./date";

type PinMessageProps = AuthorNameProps & DateProps;

const PinMessage = ({
  msg,
  userMap,
  selectedGuild,
  longDateTime,
  shortDateTime,
  getRolePath,
}: PinMessageProps) => {
  const theme = useTheme();

  return (
    <Stack
      sx={{
        flexDirection: "row",
        alignItems: "center",
        gap: "5px",
        flexWrap: "wrap",
      }}
    >
      <PushPinIcon
        sx={{
          color: theme.palette.text.disabled,
        }}
      />
      <Typography sx={{ color: theme.palette.text.primary }}>
        <AuthorName
          msg={msg}
          userMap={userMap}
          selectedGuild={selectedGuild}
          getRolePath={getRolePath}
        />
      </Typography>
      <Typography style={{ color: theme.palette.text.disabled }}>
        {` pinned a message to this channel.`}
      </Typography>
      <Date longDateTime={longDateTime} shortDateTime={shortDateTime} />
    </Stack>
  );
};
export default PinMessage;
