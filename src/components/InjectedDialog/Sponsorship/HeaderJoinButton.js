import React from "react";
import { Box, Button } from "@mui/material";
import SponsorshipStyles from "./Sponsorship.styles";

function HeaderJoinButton({ url }) {
  const classes = SponsorshipStyles();

  return (
    <Box className={classes.headerJoinButtonBox}>
      <Button
        className={classes.headerJoinButton}
        onClick={url ? () => window.open(url, "_blank") : () => {}}
        variant="outlined"
        color="primary"
      >
        Join
      </Button>
    </Box>
  );
}

export default HeaderJoinButton;
