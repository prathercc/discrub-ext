import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  IconButton,
  Stack,
} from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import SponsorshipStyles from "./Sponsorship.styles";

function InfoButton() {
  const classes = SponsorshipStyles();
  const [sponsorInfoDialogOpen, setSponsorInfoDialogOpen] = useState(false);
  const handleDialogClose = () => {
    setSponsorInfoDialogOpen(false);
  };
  return (
    <>
      <Tooltip
        arrow
        title="Server Sponsorship"
        description="View more information about sponsoring a server"
      >
        <IconButton
          className={classes.infoButton}
          onClick={() => setSponsorInfoDialogOpen(true)}
          color="secondary"
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={sponsorInfoDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            spacing={1}
          >
            <HelpIcon />
            <span>Server Sponsorship</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Reach out to{" "}
            <a
              className={classes.email}
              href="mailto:prathercc@gmail.com"
              target="_blank"
              rel="noreferrer"
            >
              prathercc@gmail.com
            </a>{" "}
            for more information about server sponsorships
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            onClick={handleDialogClose}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default InfoButton;
