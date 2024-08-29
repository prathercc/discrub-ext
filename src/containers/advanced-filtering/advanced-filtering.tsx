import { useState } from "react";
import { Stack, Button } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { useGuildSlice } from "../../features/guild/use-guild-slice";
import { useDmSlice } from "../../features/dm/use-dm-slice";
import { useMessageSlice } from "../../features/message/use-message-slice";
import AdvancedFilterModal from "./components/advanced-filter-modal";

type AdvancedFilteringProps = {
  isDm?: boolean;
};

function AdvancedFiltering({ isDm = false }: AdvancedFilteringProps) {
  const { state: guildState, setPreFilterUserId } = useGuildSlice();
  const selectedGuild = guildState.selectedGuild();

  const { state: dmState, setPreFilterUserId: dmSetPreFilterUserId } =
    useDmSlice();
  const selectedDm = dmState.selectedDm();

  const preFilterUserId = isDm
    ? dmState.preFilterUserId()
    : guildState.preFilterUserId();

  const { state: messageState, resetAdvancedFilters } = useMessageSlice();
  const messagesLoading = messageState.isLoading();
  const searchAfterDate = messageState.searchAfterDate();
  const searchBeforeDate = messageState.searchBeforeDate();
  const searchMessageContent = messageState.searchMessageContent();
  const selectedHasTypes = messageState.selectedHasTypes();

  const filtersActive = [
    searchAfterDate,
    searchBeforeDate,
    searchMessageContent,
    selectedHasTypes,
    preFilterUserId,
  ].some((val) => (Array.isArray(val) ? !!val.length : !!val));

  const [open, setOpen] = useState(false);

  const handleResetFilters = () => {
    isDm ? dmSetPreFilterUserId(null) : setPreFilterUserId(null);
    resetAdvancedFilters();
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  const getChildrenDisabled = (): boolean => {
    if (messagesLoading) return true;
    if (isDm) {
      return !selectedDm;
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
        {`Advanced Filtering${filtersActive ? " (Active)" : ""}`}
      </Button>

      <AdvancedFilterModal
        isDm={isDm}
        open={open}
        handleModalToggle={handleToggle}
        handleResetFilters={handleResetFilters}
        filtersActive={filtersActive}
      />
    </Stack>
  );
}

export default AdvancedFiltering;
