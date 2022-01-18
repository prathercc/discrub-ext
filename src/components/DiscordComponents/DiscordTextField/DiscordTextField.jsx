import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

function DiscordTextField({
  value,
  onChange,
  disabled = false,
  label,
  sx,
  select = false,
  ...props
}) {
  return (
    <TextField
      InputProps={{
        disableUnderline: true,
        startAdornment: <InputAdornment position="start"></InputAdornment>,
      }}
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
        "& .MuiFilledInput-input": {
          "&.MuiInputBase-input": {
            "&.Mui-disabled": {
              "-webkit-text-fill-color": "rgb(210, 213, 247) !important",
            },
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
        ...sx,
      }}
      label={label}
      variant="filled"
      size="small"
      fullWidth
      value={value}
      onChange={onChange}
      disabled={disabled}
      select={select}
      {...props}
    >
      {props.children}
    </TextField>
  );
}

export default DiscordTextField;
