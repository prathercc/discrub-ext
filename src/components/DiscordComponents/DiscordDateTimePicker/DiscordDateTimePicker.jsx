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
        renderInput={(props) => (
          <TextField
            sx={{
              "& .MuiInputLabel-root": {
                color: "rgb(210, 213, 247)",
                fontWeight: "bold",
                "&.Mui-focused": {
                  color: "rgb(210, 213, 247)",
                  fontWeight: "bold",
                },
                "&.Mui-disabled": {
                  color: "rgb(210, 213, 247)",
                  fontWeight: "bold",
                },
              },
              "& .MuiFilledInput-root": {
                color: "rgb(210, 213, 247)",
                backgroundColor: "transparent",
                border: "1px solid rgb(88, 101, 242)",
                overflow: "hidden",
                borderRadius: 2,
                "&.Mui-focused": {
                  color: "rgb(210, 213, 247)",
                  backgroundColor: "transparent",
                  borderColor: "rgb(88, 101, 242)",
                },
                "&:hover": {
                  backgroundColor: "transparent",
                },
                "&.Mui-disabled": {
                  backgroundColor: "transparent",
                },
              },
            }}
            variant="filled"
            size="small"
            {...props}
          />
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
