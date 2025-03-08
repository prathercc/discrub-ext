import { Autocomplete, Checkbox, Chip, ListItem } from "@mui/material";
import TextField from "@mui/material/TextField";
import ClearIcon from "@mui/icons-material/Clear";
import CopyAdornment from "../../components/copy-adornment.tsx";
import React, { forwardRef } from "react";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import SelectAllAdornment from "../../components/select-all-adornment.tsx";
import RemoveOptionAdornment from "../../components/remove-option-adornment.tsx";
import ImgAdornment from "../../components/img-adornment.tsx";

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
  onOptionRemoval?: (value: string) => void;
  getOptionIconSrc?: (value: string) => string | undefined;
  onSelectAll?: () => void;
  optionIconStyle?: React.CSSProperties;
  groupBy?: (value: string) => string;
};

const EnhancedAutocomplete = forwardRef<
  HTMLInputElement,
  EnhancedAutocompleteProps
>((props, ref) => {
  const {
    disabled = false,
    multiple = false,
    options = [],
    freeSolo = false,
    fullWidth = true,
    value,
    onChange,
    onInputChange,
    getOptionLabel,
    label,
    copyValue,
    copyName,
    onSelectAll,
    onOptionRemoval,
    getOptionIconSrc,
    optionIconStyle = {},
    groupBy,
    ...rest
  } = props;

  const isRenderingAdornment = !!(copyName || onSelectAll);
  const getAdornments = (): JSX.Element[] => {
    const arr: JSX.Element[] = [];
    if (copyName) {
      arr.push(
        <CopyAdornment
          disabled={!copyValue}
          copyValue={copyValue || ""}
          copyName={copyName}
        />,
      );
    }
    if (onSelectAll) {
      arr.push(
        <SelectAllAdornment
          onClick={onSelectAll}
          isAllSelected={value?.length === options.length}
        />,
      );
    }
    return arr;
  };

  return (
    <Autocomplete
      {...rest}
      ref={ref}
      groupBy={groupBy}
      clearIcon={<ClearIcon />}
      disabled={disabled}
      multiple={multiple}
      id={`enhanced-autocomplete-${label}`}
      options={options}
      freeSolo={freeSolo}
      fullWidth={fullWidth}
      disableCloseOnSelect={multiple}
      onChange={(_, v) => {
        onChange?.(v);
      }}
      onInputChange={(_, v) => {
        onInputChange?.(v);
      }}
      value={value}
      renderOption={(props, option, { selected }) => {
        const { ...optionProps } = props;
        return (
          <ListItem {...optionProps} dense>
            {multiple && (
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selected}
              />
            )}
            {getOptionIconSrc && getOptionIconSrc(option) && (
              <ImgAdornment
                style={{ marginRight: 8, ...optionIconStyle }}
                src={getOptionIconSrc(option) || ""}
              />
            )}
            {getOptionLabel ? getOptionLabel(option) : option}
            {onOptionRemoval && (
              <RemoveOptionAdornment
                sx={{ position: "absolute", right: 5 }}
                value={option}
                onClick={onOptionRemoval}
              />
            )}
          </ListItem>
        );
      }}
      renderTags={(value, getTagProps) => {
        const numTags = value.length;
        const limitTags = 0;

        return (
          <>
            {value.slice(0, limitTags).map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={index}
                label={getOptionLabel?.(option) || ""}
              />
            ))}

            {numTags > limitTags && ` +${numTags - limitTags}`}
          </>
        );
      }}
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
            ...(isRenderingAdornment
              ? {
                  startAdornment: (
                    <>
                      {getAdornments().map((e) => e)}
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }
              : {}),
          }}
        />
      )}
      getOptionLabel={(value) => {
        if (getOptionLabel) {
          if (Array.isArray(value)) {
            return getOptionLabel(value[0] || "");
          }
          return getOptionLabel(value || "");
        }
        return "";
      }}
    />
  );
});

export default EnhancedAutocomplete;
