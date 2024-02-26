import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { setSetting } from "../../../services/chrome-service";
import { AppSettings } from "../../../features/app/app-types";
import { DiscrubSetting } from "../../../enum/discrub-setting";

type SettingsProps = {
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
};

function Settings({ settings, onChangeSettings }: SettingsProps) {
  const handleChange = async (setting: string, value: string) => {
    const settings = await setSetting(setting, value);
    onChangeSettings(settings);
  };

  const getValue = (setting: DiscrubSetting) => {
    return settings[setting] || null;
  };

  const controls = [
    {
      name: DiscrubSetting.REACTIONS_ENABLED,
      label: "Fetch Reaction Data",
      options: [
        { value: "true", name: "Yes" },
        { value: "false", name: "No" },
      ],
    },
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

      <Stack sx={{ maxHeight: "600px", overflow: "auto" }}>
        <Stack sx={{ padding: 3, spacing: 2 }}>
          {Object.keys(settings).length &&
            controls.map((control) => {
              return (
                <FormControl fullWidth>
                  <InputLabel>{control.label}</InputLabel>
                  <Select
                    value={getValue(control.name)}
                    label={control.label}
                    onChange={(e) => {
                      if (
                        e.target.value !== null &&
                        e.target.value !== undefined
                      )
                        handleChange(control.name, e.target.value);
                    }}
                  >
                    {control.options.map((option) => {
                      return (
                        <MenuItem value={option.value}>{option.name}</MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              );
            })}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default Settings;
