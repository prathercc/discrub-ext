import { IconButton } from "@mui/material";
import Tooltip from "../common-components/tooltip/tooltip";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";

type SelectAllAdornmentProps = {
  disabled?: boolean;
  onClick: () => void;
  isAllSelected: boolean;
};

function SelectAllAdornment({
  onClick,
  isAllSelected,
  disabled = false,
}: SelectAllAdornmentProps) {
  return (
    <Tooltip title={isAllSelected ? "Deselect All" : "Select All"}>
      <IconButton disabled={disabled} onClick={onClick} color="secondary">
        {isAllSelected ? (
          <DeselectIcon fontSize="small" />
        ) : (
          <SelectAllIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

export default SelectAllAdornment;
