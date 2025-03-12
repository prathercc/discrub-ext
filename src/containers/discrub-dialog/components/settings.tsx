import { Paper, Stack, Typography } from "@mui/material";
import { DiscrubSetting } from "../../../enum/discrub-setting";
import Config from "./config";

function Settings() {
  const visibleSettings = [
    DiscrubSetting.REACTIONS_ENABLED,
    DiscrubSetting.SERVER_NICKNAME_LOOKUP,
    DiscrubSetting.DISPLAY_NAME_LOOKUP,
    DiscrubSetting.APP_USER_DATA_REFRESH_RATE,
    DiscrubSetting.DELAY_MODIFIER,
    DiscrubSetting.SEARCH_DELAY,
    DiscrubSetting.DELETE_DELAY,
    DiscrubSetting.DATE_FORMAT,
  ];

  return (
    <Paper sx={{ padding: "10px", margin: "10px 10px 0px 10px" }}>
      <Stack
        justifyContent="center"
        alignItems="flex-start"
        direction="column"
        spacing={1}
      >
        <Typography variant="body1"> Settings</Typography>
        <Typography variant="caption">Customize your experience</Typography>
      </Stack>

      <Stack sx={{ maxHeight: "470px", overflow: "auto" }}>
        <Config visibleSettings={visibleSettings} />
      </Stack>
    </Paper>
  );
}

export default Settings;
