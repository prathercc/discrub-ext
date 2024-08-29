import {
  Checkbox,
  FilledInput,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import Tooltip from "../../../common-components/tooltip/tooltip";
import { useMessageSlice } from "../../../features/message/use-message-slice";
import { SelectChangeEvent } from "@mui/material";
import { HasType as HasTypeEnum } from "../../../enum/has-type";

type HasTypeProps = {
  disabled: boolean;
};

function HasType({ disabled }: HasTypeProps) {
  const { state: messageState, setSelectedHasTypes } = useMessageSlice();
  const selectedHasTypes = messageState.selectedHasTypes();

  const handleChange = (e: SelectChangeEvent<HasTypeEnum[]>) => {
    const { value } = e.target;
    if (typeof value === "string") {
      setSelectedHasTypes(value.split(",") as HasTypeEnum[]);
    } else {
      setSelectedHasTypes(value);
    }
  };

  return (
    <Tooltip
      arrow
      title="Messages Containing"
      description="Search messages that contain the following type(s)"
      placement="left"
    >
      <FormControl sx={{ width: "100%" }}>
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
          {Object.values(HasTypeEnum).map((name) => (
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
