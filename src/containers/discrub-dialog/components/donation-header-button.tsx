import { Stack, useTheme, Button, Icon, alpha } from "@mui/material";

type DonationHeaderButtonProps = { handleToggleFeedVisibility: () => void };

function DonationHeaderButton({
  handleToggleFeedVisibility,
}: DonationHeaderButtonProps) {
  const { palette } = useTheme();

  const getIcon = () => {
    return (
      <Icon>
        <img
          style={{
            display: "flex",
            height: "inherit",
            width: "inherit",
          }}
          src="resources/media/kofi.svg"
          alt="kofi"
        />
      </Icon>
    );
  };

  return (
    <Stack
      sx={{
        width: "100%",
        position: "sticky",
        top: "0px",
        zIndex: 1000,
        backgroundColor: alpha(palette.background.paper, 0.5),
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)", // For Safari support,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Button
        onClick={handleToggleFeedVisibility}
        startIcon={getIcon()}
        endIcon={getIcon()}
        color="primary"
        variant="contained"
      >
        Ko-Fi Feed
      </Button>
    </Stack>
  );
}

export default DonationHeaderButton;
