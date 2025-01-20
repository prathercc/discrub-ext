import { useState } from "react";
import { Stack, Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { useGuildSlice } from "../../features/guild/use-guild-slice";
import { useDmSlice } from "../../features/dm/use-dm-slice";
import { useMessageSlice } from "../../features/message/use-message-slice";
import AdvancedFilterModal from "./components/advanced-filter-modal";
import { isCriteriaActive } from "../../utils.ts";

type AdvancedFilteringProps = {
  isDm?: boolean;
};

function AdvancedFiltering({ isDm = false }: AdvancedFilteringProps) {
  const { state: guildState } = useGuildSlice();
  const selectedGuild = guildState.selectedGuild();

  const { state: dmState } = useDmSlice();
  const selectedDms = dmState.selectedDms();

  const { state: messageState, resetAdvancedFilters } = useMessageSlice();
  const messagesLoading = messageState.isLoading();
  const searchCriteria = messageState.searchCriteria();
  const filtersActive = isCriteriaActive(searchCriteria);

  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  const getChildrenDisabled = (): boolean => {
    if (messagesLoading) return true;
    if (isDm) {
      return selectedDms.length !== 1;
    } else {
      return !selectedGuild;
    }
  };

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="flex-end"
      spacing={1}
    >
      <Button
        sx={{ userSelect: "none !important" }}
        disabled={getChildrenDisabled()}
        onClick={handleToggle}
        color={filtersActive ? "primary" : "secondary"}
        startIcon={filtersActive ? <FilterListIcon /> : <FilterListOffIcon />}
        variant="contained"
      >
        {`Search Criteria${filtersActive ? " (Active)" : ""}`}
      </Button>

      <AdvancedFilterModal
        isDm={isDm}
        open={open}
        handleModalToggle={handleToggle}
        handleResetFilters={resetAdvancedFilters}
        filtersActive={filtersActive}
      />
    </Stack>
  );
}

export default AdvancedFiltering;
