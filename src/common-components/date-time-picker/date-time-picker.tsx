import { useState, useEffect, forwardRef } from "react";
import { TextFieldProps } from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

type DateTimePickerProps = TextFieldProps & {
  onDateChange: (val: Date | Maybe) => void;
  value: Date | Maybe;
  label?: string;
};

const DateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(
  (props, ref) => {
    const { label, onDateChange, disabled, value = null, ...rest } = props;

    const [selectedDate, setSelectedDate] = useState<Date | Maybe>(value);

    useEffect(() => {
      setSelectedDate(value);
    }, [value]);

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MobileDateTimePicker
          ref={ref}
          disabled={disabled}
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e);
            onDateChange(e);
          }}
          slotProps={{
            dialog: {
              hideBackdrop: true,
            },
            textField: {
              size: "small",
              variant: "filled",
              fullWidth: true,
              label: label,
              ...rest,
              InputProps: {
                endAdornment: (
                  <IconButton
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDate(null);
                      onDateChange(null);
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                ),
              },
            },
          }}
        />
      </LocalizationProvider>
    );
  }
);

export default DateTimePicker;
