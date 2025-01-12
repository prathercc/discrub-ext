import { Autocomplete, Chip } from "@mui/material";
import TextField from "@mui/material/TextField";
import ClearIcon from "@mui/icons-material/Clear";
import CopyAdornment from "../../components/copy-adornment.tsx";

type EnhancedAutocompleteProps = {
  disabled?: boolean;
  multiple?: boolean;
  options?: string[];
  freeSolo?: boolean;
  fullWidth?: boolean;
  value?: string[];
  onChange?: (value: string[] | string | null) => void;
  onInputChange?: (value: string[] | string) => void;
  getOptionLabel?: (value: string) => string;
  copyValue?: string;
  copyName?: string;
  tags?: boolean;
  label: string;
};

const EnhancedAutocomplete = ({
  disabled = false,
  multiple = false,
  options = [],
  freeSolo = false,
  fullWidth = true,
  value,
  onChange,
  onInputChange,
  getOptionLabel,
  tags = false,
  label,
  copyValue,
  copyName,
}: EnhancedAutocompleteProps) => {
  return (
    <Autocomplete
      clearIcon={<ClearIcon />}
      disabled={disabled}
      multiple={multiple}
      id="enhanced-autocomplete"
      options={options}
      freeSolo={freeSolo}
      fullWidth={fullWidth}
      onChange={(_, v) => {
        onChange?.(v);
      }}
      onInputChange={(_, v) => {
        onInputChange?.(v);
      }}
      value={value}
      renderTags={
        tags && multiple
          ? (value: readonly string[], getTagProps) =>
              value.map((option: string, index: number) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    variant="outlined"
                    label={option}
                    key={key}
                    {...tagProps}
                  />
                );
              })
          : undefined
      }
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          variant="filled"
          label={label}
          fullWidth
          maxRows={1}
          InputProps={{
            ...params.InputProps,
            ...(copyName && copyValue
              ? {
                  startAdornment: (
                    <CopyAdornment copyValue={copyValue} copyName={copyName} />
                  ),
                }
              : {}),
          }}
        />
      )}
      getOptionLabel={getOptionLabel}
    />
  );
};

export default EnhancedAutocomplete;
