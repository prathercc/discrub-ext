import React from "react";
import { Box } from "@mui/material";
import SponsorshipStyles from "./Sponsorship.styles";
import HeaderLogo from "../HeaderLogo/HeaderLogo";

function HeaderBackground({ logoImage, backgroundImage }) {
  const classes = SponsorshipStyles();

  return (
    <Box className={classes.headerbackground}>
      <HeaderLogo logoImage={logoImage} />
      {backgroundImage && (
        <img
          className={classes.headerbackgroundImage}
          src={backgroundImage}
          alt=""
        />
      )}
    </Box>
  );
}

export default HeaderBackground;
