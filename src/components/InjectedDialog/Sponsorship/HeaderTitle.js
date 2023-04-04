import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import SponsorshipStyles from "./Sponsorship.styles";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

function HeaderTitle({ name }) {
  const classes = SponsorshipStyles();

  return (
    <Box className={classes.headerTitleBox}>
      <Avatar className={classes.headerTitleAvatar}>
        <VerifiedOutlinedIcon />
      </Avatar>
      <Typography variant="body2">{name}</Typography>
    </Box>
  );
}

export default HeaderTitle;
