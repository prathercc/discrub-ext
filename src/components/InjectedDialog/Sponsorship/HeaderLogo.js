import React from "react";
import { Avatar } from "@mui/material";
import SponsorshipStyles from "./Sponsorship.styles";

function HeaderLogo({ logoImage }) {
  const classes = SponsorshipStyles();

  return <Avatar src={logoImage} className={classes.headerAvatar}></Avatar>;
}

export default HeaderLogo;
