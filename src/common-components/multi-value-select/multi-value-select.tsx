import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FilledInput,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  ListSubheader,
} from "@mui/material";
import { ReactNode } from "react";

type MultiValueSelectProps = {
  disabled?: boolean;
  value: string[];
  label: string;
  onChange: (values: string[]) => void;
  values: string[];
  displayNameMap?: Record<string, string>;
  categories?: string[];
  categoryMap?: Record<string, string>;
};

const MultiValueSelect = ({
  disabled = false,
  value,
  label,
  onChange,
  values,
  displayNameMap,
  categories,
  categoryMap,
}: MultiValueSelectProps) => {
  const handleChange = (e: SelectChangeEvent<string[]>) => {
    const { value } = e.target;
    if (typeof value === "string") {
      onChange(value.split(",") as string[]);
    } else {
      onChange(value);
    }
  };

  const getMenuItem = (name: string) => (
    <MenuItem dense key={name} value={name}>
      <Checkbox size="small" checked={value?.indexOf(name) > -1} />
      <ListItemText
        primary={
          displayNameMap && displayNameMap[name] ? displayNameMap[name] : name
        }
      />
    </MenuItem>
  );

  const elements: ReactNode[] = !!(categoryMap && categories?.length)
    ? categories.reduce((acc: ReactNode[], curr) => {
        return [
          ...acc,
          <ListSubheader>{curr}</ListSubheader>,
          ...values.filter((v) => categoryMap[v] === curr).map(getMenuItem),
        ];
      }, [])
    : values.map(getMenuItem);

  return (
    <FormControl sx={{ width: "100%" }} size="small">
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
        {elements.map((e) => e)}
      </Select>
    </FormControl>
  );
};

export default MultiValueSelect;
