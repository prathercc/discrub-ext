import React from "react";
import {
  Checkbox,
  FilledInput,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMessage,
  setSelectedHasTypes,
} from "../../../features/message/messageSlice";

function HasType({ disabled }) {
  const dispatch = useDispatch();
  const { selectedHasTypes, hasTypes } = useSelector(selectMessage);

  const handleChange = (e) => {
    const { value } = e?.target || {};
    dispatch(
      setSelectedHasTypes(typeof value === "string" ? value.split(",") : value)
    );
  };

  return (
    <Tooltip
      arrow
      title="Messages Containing"
      description="Search messages by contained type(s)"
      placement="top"
    >
      <FormControl sx={{ width: 400 }}>
        <InputLabel
          variant="filled"
          size="small"
          disabled={disabled}
          id="has-type-label"
        >
          Messages Containing
        </InputLabel>
        <Select
          disabled={disabled}
          labelId="has-type-label"
          id="has-type"
          multiple
          value={selectedHasTypes}
          onChange={handleChange}
          input={<FilledInput size="small" />}
          renderValue={(selected) => selected.join(", ")}
        >
          {hasTypes.map((name) => (
            <MenuItem dense key={name} value={name}>
              <Checkbox
                size="small"
                checked={selectedHasTypes?.indexOf(name) > -1}
              />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
}

export default HasType;
