import { useState } from "react";
import { Stack, useTheme, List, Box, Skeleton, Palette } from "@mui/material";
import DonationListButton from "./donation-list-button";
import DonationHeaderButton from "./donation-header-button.tsx";
import { useDonations } from "../../../hooks/donations.ts";
import DonationFooterControls from "./donation-footer-controls.tsx";
import { AppSettings } from "../../../features/app/app-types.ts";
import { setSetting } from "../../../services/chrome-service.ts";
import { DiscrubSetting } from "../../../enum/discrub-setting.ts";
import { boolToString } from "../../../utils.ts";

type DonationComponentProps = {
  showKoFiFeed: boolean;
  onChangeSettings: (settings: AppSettings) => void;
};

function DonationComponent({
  showKoFiFeed,
  onChangeSettings,
}: DonationComponentProps) {
  const { palette } = useTheme();
  const donations = useDonations();
  const [page, setPage] = useState(1);
  const donationsPerPage = 25;
  const indexOfLastDonation = page * donationsPerPage;
  const indexOfFirstDonation = indexOfLastDonation - donationsPerPage;
  const currentDonations = donations.slice(
    indexOfFirstDonation,
    indexOfLastDonation,
  );
  const totalPages = Math.ceil(donations.length / donationsPerPage);

  const handleToggleFeedVisibility = async () => {
    const settings = await setSetting(
      DiscrubSetting.APP_SHOW_KOFI_FEED,
      boolToString(!showKoFiFeed),
    );
    onChangeSettings(settings);
  };

  return (
    <Stack spacing={2} sx={donationContainerSx(palette)}>
      <Box sx={donationBoxSx()}>
        <DonationHeaderButton
          handleToggleFeedVisibility={handleToggleFeedVisibility}
        />

        {currentDonations?.length ? (
          <List sx={donationListSx(showKoFiFeed)}>
            {currentDonations.map((donation) => (
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
        <DonationFooterControls
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      </Box>
    </Stack>
  );
}

const donationContainerSx = (palette: Palette) => ({
  position: "fixed",
  bottom: "53px",
  left: "55px",
  width: "200px",
  height: "611px",
  backgroundColor: "background.default",
  border: `1px solid ${palette.secondary.dark}`,
});

const donationBoxSx = () => ({
  height: "100%",
  overflowY: "scroll",
  overflowX: "hidden",
  backgroundColor: "background.paper",
  color: "text.primary",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  margin: "6px !important",
  padding: "3px",
});

const donationListSx = (showKoFiFeed: boolean) => ({
  opacity: showKoFiFeed ? 1 : 0,
  width: "175px",
});
export default DonationComponent;
