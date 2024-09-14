import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";
import FilterComponent from "./filter-component";
import Channel from "../../../classes/channel";
import { Filter } from "../../../features/message/message-types";

type FilterModalProps = {
  open: boolean;
  handleModalToggle: () => void;
  isDm: boolean;
  threads: Channel[];
  handleFilterUpdate: (filter: Filter) => void;
  handleResetFilters: () => void;
  filters: Filter[];
};

const FilterModal = ({
  handleModalToggle,
  open,
  isDm,
  threads,
  handleFilterUpdate,
  handleResetFilters,
  filters,
}: FilterModalProps) => {
  const handleReset = () => {
    handleResetFilters();
    handleModalToggle();
  };

  return (
    <Dialog hideBackdrop fullWidth open={open} keepMounted={!!filters.length}>
      <DialogTitle>
        <Typography variant="h5">Quick Filtering</Typography>
      </DialogTitle>
      <DialogContent>
        <FilterComponent
          isDm={isDm}
          handleFilterUpdate={handleFilterUpdate}
          threads={threads}
        />
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
export default FilterModal;
