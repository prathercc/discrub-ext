import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  IconButton,
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
        title="Server Sponsoring"
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
        <DialogTitle>Sponsor a Server</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Have a server you want to promote while also supporting the
            development of Discrub?
          </DialogContentText>
          <DialogContentText>
            Server sponsorships are currently available for $3 USD per month and
            can be setup by emailing{" "}
            <a
              className={classes.email}
              href="mailto:prathercc@gmail.com"
              target="_blank"
              rel="noreferrer"
            >
              prathercc@gmail.com
            </a>
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
