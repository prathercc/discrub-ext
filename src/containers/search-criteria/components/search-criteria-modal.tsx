import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";
import SearchCriteriaForm from "./search-criteria-form.tsx";
import { VisibleSearchCriteria } from "../search-criteria.tsx";

type SearchCriteriaModalProps = {
  open: boolean;
  handleModalToggle: () => void;
  isDm: boolean;
  handleResetFilters: () => void;
  filtersActive: boolean;
  visibleCriteria: VisibleSearchCriteria[];
};

const SearchCriteriaModal = ({
  handleModalToggle,
  open,
  isDm,
  handleResetFilters,
  filtersActive,
  visibleCriteria,
}: SearchCriteriaModalProps) => {
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
        <SearchCriteriaForm visibleCriteria={visibleCriteria} isDm={isDm} />
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
export default SearchCriteriaModal;
