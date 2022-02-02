import React, { forwardRef } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import {
  discordPrimary,
  textPrimary,
  textSecondary,
} from "../../../styleConstants";

const DiscordTextField = forwardRef(
  (
    {
      value,
      onChange,
      disabled = false,
      label,
      sx,
      select = false,
      tooltipText = null,
      ...props
    },
    ref
  ) => {
    return (
      <TextField
        ref={ref}
        InputProps={{
          disableUnderline: true,
          startAdornment: <InputAdornment position="start"></InputAdornment>,
        }}
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
          "& .MuiFilledInput-input": {
            "&.MuiInputBase-input": {
              "&.Mui-disabled": {
                "-webkit-text-fill-color": `${textSecondary} !important`,
              },
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
          borderRadius: 2,
          boxShadow: `1px 1px 1px ${discordPrimary}`,
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
);

export default DiscordTextField;
