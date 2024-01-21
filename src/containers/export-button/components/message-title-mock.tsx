import { Stack, Typography, useTheme } from "@mui/material";
import Guild from "../../../classes/guild";
import Channel from "../../../classes/channel";
import { isGuild } from "../../../app/guards";
import { isDm } from "../../../utils";

type MessageTitleMockProps = {
  entity: Channel | Guild | Maybe;
  getExportPageTitle: () => string;
};

const MessageTitleMock = ({
  entity,
  getExportPageTitle,
}: MessageTitleMockProps) => {
  const theme = useTheme();
  const description = isGuild(entity) ? entity.description : entity?.topic;

  const getName = (entity: Channel | Guild): string => {
    if (isGuild(entity) || !isDm(entity)) {
      return String(entity.name);
    } else if (isDm(entity)) {
      if (entity.recipients?.length === 1) {
        return entity.recipients[0].username;
      } else if (entity.name) {
        return `Group Chat - ${entity.name}`;
      } else {
        return `Unnamed Group Chat - ${entity.id}`;
      }
    }
    return "";
  };

  const getHash = (entity: Channel): string => {
    if (isDm(entity)) {
      return "@";
    } else {
      return "#";
    }
  };

  return (
    <Stack
      sx={{
        width: "100%",
        zIndex: 5000,
        borderBottom: "0.5px solid #202225",
        padding: "5px",
        position: "fixed",
        top: 0,
        backgroundColor: "#313338",
        "& h4": {
          userSelect: "none !important",
          cursor: "default !important",
        },
        "& h6": {
          userSelect: "none !important",
          cursor: "default !important",
        },
      }}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={1}
        ml="10px"
      >
        <Typography sx={{ color: theme.palette.text.disabled }} variant="h4">
          {entity && !isGuild(entity) && getHash(entity)}
        </Typography>
        <Typography sx={{ color: theme.palette.text.primary }} variant="h6">
          {entity && getName(entity)}
        </Typography>
        {description && (
          <Typography
            sx={{
              maxWidth: "200px",
              maxHeight: "40px",
              overflowY: "auto",
              overflowX: "hidden",
              color: `${theme.palette.text.disabled} !important`,
              whiteSpace: "pre-line",
              padding: "0px 5px 0px 5px",
            }}
            variant="caption"
          >
            {description}
          </Typography>
        )}
      </Stack>
      <Typography sx={{ color: theme.palette.text.primary }} variant="h6">
        {getExportPageTitle()}
      </Typography>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        mr="10px"
        sx={{
          borderRadius: "5px",
          padding: "5px",
          userSelect: "none !important",
          cursor: "default !important",
          "& span": {
            userSelect: "none !important",
            cursor: "default !important",
          },
        }}
      >
        <Typography
          sx={{ color: theme.palette.text.primary }}
          variant="caption"
        >
          Generated with <strong>Discrub</strong>
        </Typography>
        <img
          draggable={false}
          style={{ width: "24px", height: "24px" }}
          src="https://i92.servimg.com/u/f92/11/29/62/29/discru10.png"
          alt="Discrub Logo"
        />
      </Stack>
    </Stack>
  );
};
export default MessageTitleMock;
