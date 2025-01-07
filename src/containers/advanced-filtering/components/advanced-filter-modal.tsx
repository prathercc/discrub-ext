import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Stack,
} from "@mui/material";
import PrefilterUser from "../../../components/prefilter-user";
import BeforeAndAfterFields from "../../../components/before-and-after-fields";
import MessageContains from "./message-contains";
import HasType from "./has-type";

type AdvancedFilterModalProps = {
  open: boolean;
  handleModalToggle: () => void;
  isDm: boolean;
  handleResetFilters: () => void;
  filtersActive: boolean;
};

const AdvancedFilterModal = ({
  handleModalToggle,
  open,
  isDm,
  handleResetFilters,
  filtersActive,
}: AdvancedFilterModalProps) => {
  const handleReset = () => {
    handleResetFilters();
    handleModalToggle();
  };

  return (
    <Dialog hideBackdrop fullWidth open={open} keepMounted={filtersActive}>
      <DialogTitle>
        <Typography variant="h5">Search Criteria</Typography>
      </DialogTitle>
      <DialogContent>
        <Stack direction="column" spacing={1}>
          <PrefilterUser isDm={isDm} />
          <BeforeAndAfterFields disabled={false} />
          <MessageContains disabled={false} />
          <HasType disabled={false} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={handleReset}>
          Reset
        </Button>
        <Button
          color="secondary"
          variant="contained"
          onClick={handleModalToggle}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AdvancedFilterModal;
