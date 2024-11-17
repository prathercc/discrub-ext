import { Stack, useTheme, alpha, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type DonationFooterControlsProps = {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
};

function DonationFooterControls({
  page,
  setPage,
  totalPages,
}: DonationFooterControlsProps) {
  const { palette } = useTheme();

  return (
    <Stack
      sx={{
        width: "100%",
        position: "sticky",
        bottom: "0px",
        zIndex: 1000,
        backgroundColor: alpha(palette.background.paper, 0.5),
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)", // For Safari support,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {totalPages >= 1 && (
        <Stack
          sx={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <IconButton disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="caption">
            Page {page} of {totalPages}
          </Typography>
          <IconButton
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
}

export default DonationFooterControls;
