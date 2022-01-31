import * as React from "react";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateTimePicker from "@mui/lab/DateTimePicker";
import InputAdornment from "@mui/material/InputAdornment";
import { textSecondary, textPrimary } from "../../../styleConstants";

const DiscordDateTimePicker = ({ label, onChange }) => {
  const [value, setValue] = React.useState(null);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        renderInput={(props) => (
          <TextField
            sx={{
              "& .MuiInputLabel-root": {
                color: textSecondary,
                fontWeight: "bold",
                "&.Mui-focused": {
                  color: textSecondary,
                  fontWeight: "bold",
                },
                "&.Mui-disabled": {
                  color: textSecondary,
                  fontWeight: "bold",
                },
              },
              "& .MuiFilledInput-root": {
                color: textSecondary,
                backgroundColor: "transparent",
                border: `1px solid ${textPrimary}`,
                overflow: "hidden",
                borderRadius: 2,
                "&.Mui-focused": {
                  color: textSecondary,
                  backgroundColor: "transparent",
                  borderColor: textPrimary,
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
