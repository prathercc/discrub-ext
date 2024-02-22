import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { getSettings, setSetting } from "../../../services/chrome-service";
import { useState, useEffect } from "react";

function Settings() {
  const [settings, setSettings] = useState<Record<string, string | number>>({});
  const [isStale, setIsStale] = useState(true);

  useEffect(() => {
    const getLatestSettings = async () => {
      setSettings(await getSettings());
    };
    if (isStale) {
      setIsStale(false);
      getLatestSettings();
    }
  }, [isStale]);

  const handleChange = async (setting: string, value: string | number) => {
    await setSetting(setting, value);
    setIsStale(true);
  };

  const getValue = (setting: string) => {
    return settings[setting] || null;
  };

  const controls = [
    {
      name: "fetchReactionData",
      label: "Fetch Reaction Data",
      options: [
        { value: 1, name: "Yes" },
        { value: -1, name: "No" },
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
