import { Stack, Button, Icon } from "@mui/material";
import { transparancy } from "../../../theme.ts";

type DonationHeaderButtonProps = { handleToggleFeedVisibility: () => void };

function DonationHeaderButton({
  handleToggleFeedVisibility,
}: DonationHeaderButtonProps) {
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
        ...transparancy,
        width: "100%",
        position: "sticky",
        top: "0px",
        zIndex: 1000,
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
