import { Button, Stack } from "@mui/material";
import WestIcon from "@mui/icons-material/West";
import EastIcon from "@mui/icons-material/East";

type PageFooterControlsProps = {
  currentPage: number;
  totalPages: number;
  safeEntityName: string;
};

const PageFooterControls = ({
  currentPage,
  totalPages,
  safeEntityName,
}: PageFooterControlsProps) => {
  const resolvePageUrl = (page: number) => {
    return `./${safeEntityName}_page_${page}.html`;
  };

  return (
    <Stack
      sx={{
        width: "100%",
        zIndex: 5000,
        borderTop: "0.5px solid #202225",
        padding: "5px",
        position: "fixed",
        bottom: 0,
        backgroundColor: "#313338",
        "& h4": {
          userSelect: "none !important",
          cursor: "default !important",
        },
        "& h6": {
          userSelect: "none !important",
          cursor: "default !important",
        },
      }}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Stack
        gap="15px"
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ width: "100%" }}
      >
        <Button
          startIcon={<WestIcon />}
          variant="contained"
          href={resolvePageUrl(currentPage - 1)}
          color="secondary"
          disabled={currentPage === 1}
        >
          Prev. Page
        </Button>
        <Button
          endIcon={<EastIcon />}
          variant="contained"
          href={resolvePageUrl(currentPage + 1)}
          color="secondary"
          disabled={currentPage === totalPages}
        >
          Next Page
        </Button>
      </Stack>
    </Stack>
  );
};
export default PageFooterControls;
