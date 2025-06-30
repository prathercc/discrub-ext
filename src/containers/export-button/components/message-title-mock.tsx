import { Button, Stack, Theme, Typography, useTheme } from "@mui/material";
import Guild from "../../../classes/guild";
import Channel from "../../../classes/channel";
import { isGuild } from "../../../app/guards";
import { isDm } from "../../../utils";
import { transparancy } from "../../../theme.ts";
import { ExportData } from "../../../features/export/export-types.ts";

type MessageTitleMockProps = {
  entity: Channel | Guild | Maybe;
  getExportPageTitle: () => string;
  exportData: ExportData;
};

const MessageTitleMock = ({
  entity,
  getExportPageTitle,
  exportData,
}: MessageTitleMockProps) => {
  const theme = useTheme();
  const description = isGuild(entity) ? entity.description : entity?.topic;
  const { currentThread } = exportData;

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
      sx={titleMockStackSx()}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Stack direction="column" alignItems="flex-start">
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={1}
          ml="10px"
          component="a"
          href="#description"
          sx={{
            textDecoration: "none",
          }}
        >
          <Typography sx={hashTypographySx(theme)} variant="h4">
            {entity && !isGuild(entity) && getHash(entity)}
          </Typography>
          <Typography sx={nameTypographySx(theme)} variant="h6">
            {entity && getName(entity)}
          </Typography>
          {!!currentThread && (
            <Typography sx={nameTypographySx(theme)} variant="h6">
              / {currentThread.name}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Typography sx={primaryTypographySx(theme)} variant="h6">
        {getExportPageTitle()}
      </Typography>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        mr="10px"
        sx={brandStackSx()}
      >
        <Typography sx={generatedWithTypographySx(theme)} variant="caption">
          Generated with <strong>Discrub</strong>
        </Typography>
        <img
          draggable={false}
          style={{ width: "24px", height: "24px" }}
          src="../discrub_media/discrub.png"
          alt="Discrub Logo"
        />
      </Stack>
      <Stack id="description" sx={descriptionBoxSx(theme)}>
        <Typography sx={disabledTypographySx(theme)} variant="h6">
          Description
        </Typography>
        <Typography>{description || "N/A"}</Typography>
        <Button sx={{ maxWidth: "fit-content" }} variant="contained" href="#/">
          Close
        </Button>
      </Stack>
    </Stack>
  );
};

const titleMockStackSx = () => ({
  ...transparancy,
  width: "100%",
  zIndex: 5000,
  borderBottom: "0.5px solid #202225",
  padding: "5px",
  position: "sticky",
  top: 0,
  "& h4": {
    userSelect: "none !important",
  },
  "& h6": {
    userSelect: "none !important",
  },
});

const disabledTypographySx = (theme: Theme) => ({
  color: theme.palette.text.disabled,
});

const hashTypographySx = (theme: Theme) => ({
  ...disabledTypographySx(theme),
  cursor: "pointer",
});

const primaryTypographySx = (theme: Theme) => ({
  color: theme.palette.text.primary,
});

const nameTypographySx = (theme: Theme) => ({
  ...primaryTypographySx(theme),
  cursor: "pointer",
});

const brandStackSx = () => ({
  borderRadius: "5px",
  padding: "5px",
  userSelect: "none !important",
  cursor: "default !important",
  "& span": {
    userSelect: "none !important",
    cursor: "default !important",
  },
});

const generatedWithTypographySx = (theme: Theme) => ({
  color: theme.palette.text.primary,
});

const descriptionBoxSx = (theme: Theme) => ({
  padding: "15px",
  backgroundColor: "background.paper",
  border: `1px solid ${theme.palette.secondary.dark}`,
  borderRadius: "5px",
  display: "none",
  width: "300px",
  color: "white",
  "&:target": {
    display: "flex",
    gap: "5px",
    position: "fixed",
    alignItems: "center",
    top: "60px",
  },
});
export default MessageTitleMock;
