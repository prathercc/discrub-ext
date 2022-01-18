import * as React from "react";
import Checkbox from "@mui/material/Checkbox";

const DiscordCheckBox = (props) => {
  return (
    <Checkbox
      {...props}
      sx={{
        color: "rgb(88, 101, 242)",
        "&.Mui-checked": {
          color: "rgb(88, 101, 242)",
        },
        "&.MuiCheckbox-indeterminate": {
          color: "rgb(88, 101, 242)",
        },
        ...props.sx,
      }}
    />
  );
};

export default DiscordCheckBox;
