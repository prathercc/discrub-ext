import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { Avatar, Stack, Typography, IconButton, useTheme } from "@mui/material";
import { Donation, fetchDonationData } from "../../../services/github-service";
import { differenceInDays, parseISO } from "date-fns";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import Tooltip from "../../../common-components/tooltip/tooltip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function DonationComponent({
  closeAnnouncement,
}: {
  closeAnnouncement: () => void;
}) {
  const theme = useTheme();
  const [donations, setDonations] = useState<Donation[]>([]);
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
      spacing={2}
      sx={{
        position: "fixed",
        bottom: "2px",
        right: "27px",
        width: "1200px",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: theme.spacing(1),
      }}
    >
      <Box
        sx={{
          position: "fixed",
          bottom: "46px",
          right: "221px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "803px",
          justifyContent: "space-between",
        }}
      >
        <IconButton
          disabled={startIndex === 0}
          onClick={() => {
            if (startIndex > 0) {
              setStartIndex(startIndex - 3);
            }
          }}
          color="primary"
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
          color="primary"
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>
      {donations.slice(startIndex, startIndex + 3).map((donation) => {
        const daysSince = differenceInDays(new Date(), parseISO(donation.date));
        return (
          <Tooltip title={donation.name} description={donation.message}>
            <Box
              onMouseOver={closeAnnouncement}
              sx={{
                border: `1px solid ${theme.palette.background.default}`,
                backgroundColor: theme.palette.primary.dark,
                padding: "0px 5px 0px 5px",
                borderRadius: "10px",
                boxShadow: "4px 2px 5px 1px rgb(0 0 0 / 41%)",
              }}
            >
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
                  <Avatar
                    sx={{
                      backgroundColor: "transparent",
                      color: "text.primary",
                    }}
                  >
                    <LocalCafeOutlinedIcon />
                  </Avatar>
                  <Typography
                    color="text.primary"
                    variant="body2"
                    sx={{ userSelect: "none" }}
                  >
                    <strong>{donation.name}</strong> donated{" "}
                    <strong>${donation.dollars}</strong> ·{" "}
                    <i>
                      {daysSince > 0
                        ? `${daysSince} Day${daysSince === 1 ? "" : "s"} Ago`
                        : "Today"}
                    </i>
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

export default DonationComponent;
