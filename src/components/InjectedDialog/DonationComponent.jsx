import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { Avatar, Stack, Typography, IconButton } from "@mui/material";
import DonationComponentStyles from "./DonationComponent.styles";
import { fetchDonationData } from "../../announcementService";
import { differenceInDays, parseISO } from "date-fns";
import CoffeeIcon from "@mui/icons-material/Coffee";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function DonationComponent() {
  const classes = DonationComponentStyles();
  const [donations, setDonations] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  useEffect(() => {
    const getDonationData = async () => {
      const data = await fetchDonationData();
      setDonations(data);
    };
    getDonationData();
  }, []);

  return (
    <Stack
      className={classes.stack}
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >
      <Box className={classes.arrowBox}>
        <IconButton
          disabled={startIndex === 0}
          onClick={() => {
            if (startIndex > 0) {
              setStartIndex(startIndex - 3);
            }
          }}
          color="secondary"
        >
          <ArrowBackIcon />
        </IconButton>
        <IconButton
          disabled={
            startIndex === donations.length - 1 || !donations[startIndex + 3]
          }
          onClick={() => {
            if (startIndex < donations.length - 1) {
              setStartIndex(startIndex + 3);
            }
          }}
          color="secondary"
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>
      {donations.slice(startIndex, startIndex + 3).map((donation) => (
        <Tooltip description={`"${donation.message}"`}>
          <Box className={classes.box}>
            <Stack
              direction="column"
              justifyContent="center"
              alignItems="flex-start"
              spacing={2}
            >
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <Avatar>
                  <CoffeeIcon />
                </Avatar>
                <Typography variant="body1">
                  <strong>{donation.name}</strong> bought{" "}
                  <strong>{donation.amount}</strong> coffee
                  {donation.amount > 1 ? "s" : ""} ·{" "}
                  <i className={classes.date}>
                    {differenceInDays(new Date(), parseISO(donation.date))} days
                    ago
                  </i>
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Tooltip>
      ))}
    </Stack>
  );
}

export default DonationComponent;
