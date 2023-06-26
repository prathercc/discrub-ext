import React from "react";
import { Box, Typography } from "@mui/material";
import SponsorshipStyles from "./Sponsorship.styles";

function HeaderSummary({ description }) {
  const classes = SponsorshipStyles();

  return (
    <Box className={classes.headerSummaryBox}>
      <Typography className={classes.headerSummaryTypography} variant="caption">
        {description}
      </Typography>
    </Box>
  );
}

export default HeaderSummary;
