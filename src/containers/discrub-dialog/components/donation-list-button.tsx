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

  const getBackgroundColor = (): string => {
    const { dollars } = donation;
    if (dollars >= 75) {
      return "rgba(142, 160, 225, 0.25)";
    }
    if (dollars >= 50) {
      return "rgba(142, 160, 225, 0.2)";
    }
    if (dollars < 50 && dollars >= 20) {
      return "rgba(142, 160, 225, 0.1)";
    }
    if (dollars < 20 && dollars >= 10) {
      return "rgba(142, 160, 225, 0.05)";
    }
    return "transparent";
  };

  return (
    <>
      <ListItemButton
        sx={{
          padding: "4px 4px 4px 4px",
          gap: "5px",
          backgroundColor: getBackgroundColor(),
          borderRadius: "10px",
          mt: 1,
        }}
        dense
        onClick={handleClick}
      >
        {
          <ListItemIcon
            sx={{
              width: "24px",
              height: "24px",
              marginRight: "5px",
              padding: "3px",
              justifyContent: "center",
              alignItems: "center",
              minWidth: "unset",
              fontWeight: "bold",
            }}
          >
            ${donation.dollars}
          </ListItemIcon>
        }
        <ListItemText primary={donation.name} secondary={ago} />
        {donation.message && (
          <>{collapsed ? <SpeakerNotesOffIcon /> : <ChatIcon />}</>
        )}
      </ListItemButton>
      <Collapse in={collapsed}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "left",
            padding: "5px 10px 5px 10px",
            backgroundColor: "rgb(30, 33, 36)",
            borderRadius: "5px",
            opacity: donation.message.length,
          }}
        >
          <Typography variant="caption">{donation.message}</Typography>
        </Box>
      </Collapse>
    </>
  );
}

export default DonationListButton;
