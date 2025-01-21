import { useState } from "react";
import { Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { useGuildSlice } from "../../../features/guild/use-guild-slice.ts";
import { useDmSlice } from "../../../features/dm/use-dm-slice.ts";
import { useMessageSlice } from "../../../features/message/use-message-slice.ts";
import SearchCriteriaModal from "./search-criteria-modal.tsx";
import { isCriteriaActive } from "../../../utils.ts";

type SearchCriteriaButtonProps = {
  isDm?: boolean;
};

function SearchCriteriaButton({ isDm = false }: SearchCriteriaButtonProps) {
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
      return !selectedDms.length;
    } else {
      return !selectedGuild;
    }
  };

  return (
    <>
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

      <SearchCriteriaModal
        isDm={isDm}
        open={open}
        handleModalToggle={handleToggle}
        handleResetFilters={resetAdvancedFilters}
        filtersActive={filtersActive}
      />
    </>
  );
}

export default SearchCriteriaButton;
