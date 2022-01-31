import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import { textPrimary } from "../../../styleConstants";

const DiscordCheckBox = (props) => {
  return (
    <Checkbox
      {...props}
      sx={{
        color: textPrimary,
        "&.Mui-checked": {
          color: textPrimary,
        },
        "&.MuiCheckbox-indeterminate": {
          color: textPrimary,
        },
        ...props.sx,
      }}
    />
  );
};

export default DiscordCheckBox;
