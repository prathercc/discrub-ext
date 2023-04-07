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
} from "@mui/material";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";
import GoogleIcon from "@mui/icons-material/Google";
import CoffeeIcon from "@mui/icons-material/Coffee";

function DonationDialog() {
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const handleDialogClose = () => {
    setDonationDialogOpen(false);
  };
  return (
    <>
      <Tooltip
        arrow
        title="Leave a Review / Ko-Fi Donation"
        description="Support the extension's development by leaving a review or by gifting the developer a much needed coffee ☕!"
      >
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
            <VolunteerActivismIcon />
            <span>Leave a Review / Ko-Fi Donation</span>
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
                alignItems="center"
                spacing={2}
              >
                <div>
                  Thanks for taking the time to try out Discrub! Reviews and
                  donations are never expected but they are greatly appreciated
                  and help support the development of this extension!
                </div>
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
                    style={{
                      width: "260px",
                      height: "152px",
                      borderRadius: "10px",
                      border: "1px solid rgb(88, 101, 242)",
                      marginTop: "10px",
                    }}
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
                    Continue to Google
                  </Button>
                </Stack>
                <Stack
                  direction="column"
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}
                >
                  <img
                    style={{
                      width: "260px",
                      height: "152px",
                      borderRadius: "10px",
                      border: "1px solid rgb(88, 101, 242)",
                      marginTop: "10px",
                    }}
                    src="ko-fi.png"
                    alt="Ko-Fi Preview"
                  />
                  <Button
                    startIcon={<CoffeeIcon />}
                    variant="contained"
                    disableElevation
                    onClick={() =>
                      window.open("https://ko-fi.com//prathercc", "_blank")
                    }
                  >
                    Continue to Ko-Fi
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
