import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FilledInput,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
} from "@mui/material";

type MultiValueSelectProps = {
  disabled?: boolean;
  value: string[];
  label: string;
  onChange: (values: string[]) => void;
  values: string[];
  displayNameMap?: Record<string, string>;
};

const MultiValueSelect = ({
  disabled = false,
  value,
  label,
  onChange,
  values,
  displayNameMap,
}: MultiValueSelectProps) => {
  const handleChange = (e: SelectChangeEvent<string[]>) => {
    const { value } = e.target;
    if (typeof value === "string") {
      onChange(value.split(",") as string[]);
    } else {
      onChange(value);
    }
  };

  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel
        variant="filled"
        size="small"
        disabled={disabled}
        id="has-type-label"
      >
        {label}
      </InputLabel>
      <Select
        disabled={disabled}
        labelId="label"
        id="multi-value-select"
        multiple
        value={value}
        onChange={handleChange}
        input={<FilledInput size="small" />}
        renderValue={(selected) =>
          (displayNameMap
            ? selected.map((s) => displayNameMap[s] || s)
            : selected
          ).join(", ")
        }
      >
        {values.map((name) => (
          <MenuItem dense key={name} value={name}>
            <Checkbox size="small" checked={value?.indexOf(name) > -1} />
            <ListItemText
              primary={
                displayNameMap && displayNameMap[name]
                  ? displayNameMap[name]
                  : name
              }
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultiValueSelect;
