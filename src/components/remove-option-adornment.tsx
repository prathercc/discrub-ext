import { IconButton, SxProps } from "@mui/material";
import Tooltip from "../common-components/tooltip/tooltip";
import ClearIcon from "@mui/icons-material/Clear";

type RemoveOptionAdornmentProps = {
  disabled?: boolean;
  value: string;
  onClick: (value: string) => void;
  sx?: SxProps;
};

function RemoveOptionAdornment({
  value,
  onClick,
  disabled = false,
  sx = {},
}: RemoveOptionAdornmentProps) {
  return (
    <Tooltip title="Remove">
      <IconButton
        sx={{ ...sx }}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          onClick(value);
        }}
        color="secondary"
      >
        <ClearIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

export default RemoveOptionAdornment;
