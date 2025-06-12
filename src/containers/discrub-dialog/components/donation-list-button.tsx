import { useState } from "react";
import {
  Typography,
  ListItemButton,
  Collapse,
  ListItemText,
  Box,
  ListItemIcon,
} from "@mui/material";
import { Donation } from "../../../services/github-service";
import { differenceInDays, parseISO } from "date-fns";
import ChatIcon from "@mui/icons-material/Chat";
import SpeakerNotesOffIcon from "@mui/icons-material/SpeakerNotesOff";

function DonationListButton({ donation }: { donation: Donation }) {
  const [collapsed, setCollapsed] = useState(true);
  const days = differenceInDays(new Date(), parseISO(donation.date));
  const ago =
    days > 0 ? `${days} day${days === 1 ? "" : "s"} ago` : "Just earlier 😊";

  const handleClick = () => {
    if (donation.message) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <>
      <ListItemButton
        sx={listItemBtnSx(donation.dollars)}
        dense
        onClick={handleClick}
      >
        <ListItemIcon sx={listItemIconSx()}>${donation.dollars}</ListItemIcon>
        <ListItemText primary={donation.name} secondary={ago} />
        {donation.message &&
          (collapsed ? <SpeakerNotesOffIcon /> : <ChatIcon />)}
      </ListItemButton>
      {donation.message && (
        <Collapse in={collapsed}>
          <Box sx={donationMsgBoxSx()}>
            <Typography variant="caption">{donation.message}</Typography>
          </Box>
        </Collapse>
      )}
    </>
  );
}

const donationMsgBoxSx = () => ({
  display: "flex",
  justifyContent: "left",
  padding: "5px 10px 5px 10px",
  backgroundColor: "rgb(30, 33, 36)",
  borderRadius: "5px",
  overflowX: "auto",
});

const listItemIconSx = () => ({
  width: "24px",
  height: "24px",
  marginRight: "5px",
  padding: "3px",
  justifyContent: "center",
  alignItems: "center",
  minWidth: "unset",
  fontWeight: "bold",
});

const listItemBtnSx = (dollars: number) => {
  let bgColor = "transparent";
  if (dollars >= 75) {
    bgColor = "rgba(142, 160, 225, 0.25)";
  }
  if (dollars >= 50) {
    bgColor = "rgba(142, 160, 225, 0.2)";
  }
  if (dollars < 50 && dollars >= 20) {
    bgColor = "rgba(142, 160, 225, 0.1)";
  }
  if (dollars < 20 && dollars >= 10) {
    bgColor = "rgba(142, 160, 225, 0.05)";
  }
  return {
    padding: "4px 4px 4px 4px",
    gap: "5px",
    backgroundColor: bgColor,
    borderRadius: "10px",
    mt: 1,
  };
};
export default DonationListButton;
