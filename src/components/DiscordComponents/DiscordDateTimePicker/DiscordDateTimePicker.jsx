import * as React from "react";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateTimePicker from "@mui/lab/DateTimePicker";
import InputAdornment from "@mui/material/InputAdornment";

const DiscordDateTimePicker = ({ label, onChange }) => {
  const [value, setValue] = React.useState(null);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        renderInput={(props) => <TextField variant="filled" {...props} />}
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
