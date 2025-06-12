import { Stack, Button, Icon } from "@mui/material";

type DonationHeaderButtonProps = { handleToggleFeedVisibility: () => void };

function DonationHeaderButton({
  handleToggleFeedVisibility,
}: DonationHeaderButtonProps) {
  const getIcon = () => {
    return (
      <Icon>
        <img style={iconStyles()} src="resources/media/kofi.svg" alt="kofi" />
      </Icon>
    );
  };

  return (
    <Stack sx={donationHeaderContainerSx()}>
      <Button
        onClick={handleToggleFeedVisibility}
        startIcon={getIcon()}
        color="primary"
        variant="contained"
      >
        Ko-Fi Feed
      </Button>
    </Stack>
  );
}

const donationHeaderContainerSx = () => ({
  width: "100%",
  position: "sticky",
  top: "0px",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const iconStyles = () => ({
  display: "flex",
  height: "inherit",
  width: "inherit",
});

export default DonationHeaderButton;
