import { useState, useEffect, forwardRef } from "react";
import { TextFieldProps } from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { DateTimePicker as Picker } from "@mui/x-date-pickers/DateTimePicker";

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
        <Picker
          ref={ref}
          disabled={disabled}
          label={label}
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e);
            if (e && !isNaN(e.getTime())) {
              onDateChange(e);
            } else {
              onDateChange(null);
            }
          }}
          slotProps={{
            field: { clearable: true },
            textField: {
              size: "small",
              variant: "filled",
              fullWidth: true,
              label: label,
              ...rest,
            },
          }}
        />
      </LocalizationProvider>
    );
  },
);

export default DateTimePicker;
