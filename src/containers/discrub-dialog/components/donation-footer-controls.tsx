import { Stack, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { transparancy } from "../../../theme.ts";

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
  return (
    <Stack
      sx={{
        ...transparancy,
        width: "100%",
        position: "sticky",
        bottom: "0px",
        zIndex: 1000,
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
