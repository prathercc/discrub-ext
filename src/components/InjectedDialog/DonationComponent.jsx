import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { Avatar, Stack, Typography } from "@mui/material";
import DonationComponentStyles from "./DonationComponent.styles";
import { fetchDonationData } from "../../announcementService";
import { differenceInDays, parseISO } from "date-fns";
import CoffeeIcon from "@mui/icons-material/Coffee";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";

function DonationComponent() {
  const classes = DonationComponentStyles();
  const [donations, setDonations] = useState([]);
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
      {donations.map((donation) => (
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
                  <strong>{donation.name}</strong> bought a coffee ·{" "}
                  <i className={classes.date}>
                    {differenceInDays(new Date(), parseISO(donation.date))} days
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
