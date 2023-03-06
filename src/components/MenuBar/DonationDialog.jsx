import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Tab,
} from "@mui/material";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";

function DonationDialog() {
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const handleDialogClose = () => {
    setDonationDialogOpen(false);
  };
  return (
    <>
      <Tooltip
        arrow
        title="Ko-Fi Donations"
        description="Support the extension's development by gifting the developer a much needed coffee ☕"
      >
        <Tab
          onClick={(e) => {
            setDonationDialogOpen(true);
          }}
          icon={<VolunteerActivismIcon />}
        />
      </Tooltip>

      <Dialog open={donationDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Ko-Fi Donations</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <div>
              Thank you for taking the time to try out Discrub, while donations
              are never expected, they are very much welcome and appreciated!
            </div>
            <img
              style={{
                width: "560px",
                borderRadius: "10px",
                border: "1px solid rgb(88, 101, 242)",
                marginTop: "10px",
              }}
              src="ko-fi.png"
              alt="Ko-Fi Preview"
            />
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
          <Button
            variant="contained"
            disableElevation
            onClick={() =>
              window.open("https://ko-fi.com//prathercc", "_blank")
            }
          >
            Continue to Ko-Fi
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DonationDialog;
