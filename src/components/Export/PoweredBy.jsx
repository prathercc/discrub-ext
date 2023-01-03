import React from "react";
import { Stack, Typography } from "@mui/material";
import ExportButtonGroupStyles from "./ExportButtonGroup.styles";

const PoweredBy = () => {
  const classes = ExportButtonGroupStyles();

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={1}
      mr="10px"
      className={classes.poweredByStack}
    >
      <Typography className={classes.typographyTitle} variant="caption">
        Generated with <strong>Discrub</strong>
      </Typography>
      <img
        draggable={false}
        style={{ width: "24px", height: "24px" }}
        src="https://i92.servimg.com/u/f92/11/29/62/29/discru10.png"
        alt="Discrub Logo"
      />
    </Stack>
  );
};
export default PoweredBy;
