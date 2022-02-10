import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import { textSecondary } from "../../../styleConstants";

const DiscordCheckBox = (props) => {
  return (
    <Checkbox
      {...props}
      sx={{
        color: textSecondary,
        "&.Mui-checked": {
          color: textSecondary,
        },
        "&.MuiCheckbox-indeterminate": {
          color: textSecondary,
        },
        ...props.sx,
      }}
    />
  );
};

export default DiscordCheckBox;
