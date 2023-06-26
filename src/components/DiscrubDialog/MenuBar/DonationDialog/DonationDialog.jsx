import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Tab,
  Stack,
  Typography,
} from "@mui/material";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import Tooltip from "../../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import GoogleIcon from "@mui/icons-material/Google";
import CoffeeIcon from "@mui/icons-material/Coffee";
import DonationDialogStyles from "../Styles/DonationDialog.styles";

function DonationDialog() {
  const classes = DonationDialogStyles();
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const handleDialogClose = () => {
    setDonationDialogOpen(false);
  };
  return (
    <>
      <Tooltip arrow title="Review or Donate">
        <Tab
          onClick={(e) => {
            setDonationDialogOpen(true);
          }}
          icon={<VolunteerActivismIcon />}
        />
      </Tooltip>

      <Dialog open={donationDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            spacing={1}
          >
            <VolunteerActivismIcon /> <span>Review or Donate</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Stack
              direction="column"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={1}
              >
                <Typography variant="body2">
                  Reviews and donations are never required but are always
                  appreciated and help ensure that Discrub's active development
                  can continue 👨‍💻
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-around"
                alignItems="center"
                spacing={2}
                sx={{ width: "100%" }}
              >
                <Stack
                  direction="column"
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}
                >
                  <img
                    className={classes.previewImage}
                    src="googlereview.png"
                    alt="Google Review Preview"
                  />
                  <Button
                    startIcon={<GoogleIcon />}
                    variant="contained"
                    disableElevation
                    onClick={() =>
                      window.open(
                        "https://chrome.google.com/webstore/detail/discrub/plhdclenpaecffbcefjmpkkbdpkmhhbj",
                        "_blank"
                      )
                    }
                  >
                    Review on Google
                  </Button>
                </Stack>
                <Stack
                  direction="column"
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}
                >
                  <img
                    className={classes.previewImage}
                    src="ko-fi.png"
                    alt="Ko-Fi Preview"
                  />
                  <Button
                    startIcon={<CoffeeIcon />}
                    variant="contained"
                    disableElevation
                    onClick={() =>
                      window.open("https://ko-fi.com/prathercc", "_blank")
                    }
                  >
                    Donate with Ko-Fi
                  </Button>
                </Stack>
              </Stack>
            </Stack>
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

export default DonationDialog;
