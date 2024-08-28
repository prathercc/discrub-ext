import { useEffect, useState } from "react";
import {
  Stack,
  useTheme,
  List,
  Box,
  Icon,
  Skeleton,
  Typography,
} from "@mui/material";
import { Donation, fetchDonationData } from "../../../services/github-service";
import DonationListButton from "./donation-list-button";

function DonationComponent() {
  const { palette } = useTheme();
  const [donations, setDonations] = useState<Donation[]>([]);
  useEffect(() => {
    const getDonationData = async () => {
      const data = await fetchDonationData();
      setDonations(data);
    };
    getDonationData();
  }, []);

  return (
    <Stack
      spacing={2}
      sx={{
        position: "fixed",
        bottom: "53px",
        left: "55px",
        width: "200px",
        height: "611px",
        backgroundColor: palette.background.default,
        border: `1px solid ${palette.secondary.dark}`,
      }}
    >
      <Box
        sx={{
          height: "100%",
          overflowY: "scroll",
          bgcolor: "background.paper",
          color: "text.primary",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "6px !important",
          padding: "3px",
        }}
      >
        <Stack
          sx={{
            flexDirection: "row",
            gap: "15px",
            width: "100%",
            borderRadius: "5px",
            backgroundColor: "primary.dark",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "rgba(232, 217, 217, 0.75) 2px 2px 5px -2px",
          }}
        >
          <Icon>
            <img
              style={{ display: "flex", height: "inherit", width: "inherit" }}
              src="resources/media/kofi.svg"
              alt="kofi"
            />
          </Icon>
          <Typography variant="body1">Ko-Fi Feed</Typography>
          <Icon>
            <img
              style={{ display: "flex", height: "inherit", width: "inherit" }}
              src="resources/media/kofi.svg"
              alt="kofi"
            />
          </Icon>
        </Stack>

        {donations?.length ? (
          <List>
            {donations.map((donation) => (
              <DonationListButton donation={donation} />
            ))}
          </List>
        ) : (
          <>
            {Array.from(Array(9)).map((_) => (
              <Skeleton
                animation="wave"
                sx={{ mt: 1 }}
                variant="rounded"
                height="90%"
                width="90%"
              />
            ))}
          </>
        )}
      </Box>
    </Stack>
  );
}

export default DonationComponent;
