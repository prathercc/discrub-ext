import * as React from "react";
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import InputAdornment from "@mui/material/InputAdornment";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";

const DiscordDateTimePicker = ({ label, onChange }) => {
  const [value, setValue] = React.useState(null);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MobileDateTimePicker
        clearable
        renderInput={(props) => (
          <TextField size="small" fullWidth variant="filled" {...props} />
        )}
        label={label}
        value={value}
        onChange={(e) => {
          setValue(e);
          onChange(e);
        }}
        InputProps={{
          disableUnderline: true,
          startAdornment: <InputAdornment position="start"></InputAdornment>,
        }}
        DialogProps={{
          sx: {
            "& .MuiButton-textSizeMedium": {
              color: "rgb(210, 213, 247) !important",
              background: "rgb(88, 101, 242)",
              "&:hover": {
                background: "rgb(88, 101, 242)",
              },
            },
            "& .MuiTypography-caption": { color: "rgb(210, 213, 247)" },
            "& .MuiPickersDay-today": {
              border: "1px solid rgb(210, 213, 247) !important",
            },
            "& .MuiSvgIcon-root": { color: "rgb(210, 213, 247)" },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DiscordDateTimePicker;
