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
          <TextField fullWidth variant="filled" {...props} />
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
      />
    </LocalizationProvider>
  );
};

export default DiscordDateTimePicker;
