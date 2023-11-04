import React from "react";
import { Stack, Button, Collapse } from "@mui/material";
import AdvancedFilteringStyles from "./AdvancedFiltering.styles";
import BeforeAndAfterFields from "../BeforeAndAfterFields/BeforeAndAfterFields";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import PrefilterUser from "../PrefilterUser/PrefilterUser";
import MessageContains from "../MessageContains/MessageContains";
import HasType from "../HasType/HasType";
import { useSelector } from "react-redux";
import { selectGuild } from "../../../features/guild/guildSlice";
import { selectDm } from "../../../features/dm/dmSlice";
import { selectMessage } from "../../../features/message/messageSlice";

function AdvancedFiltering({
  closeAnnouncement = () => {},
  isDm = false,
  setShowOptionalFilters,
  showOptionalFilters,
}) {
  const { selectedGuild } = useSelector(selectGuild);
  const { selectedDm } = useSelector(selectDm);
  const { isLoading: messagesLoading } = useSelector(selectMessage);

  const classes = AdvancedFilteringStyles();

  const handleFilterButtonClick = () => {
    closeAnnouncement();
    setShowOptionalFilters(!showOptionalFilters);
  };

  const disabled =
    (isDm ? selectedDm : selectedGuild).id === null || messagesLoading;

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={1}
    >
      <Button
        className={classes.filterButton}
        disabled={messagesLoading}
        onClick={handleFilterButtonClick}
        color="secondary"
        startIcon={
          showOptionalFilters ? <FilterListOffIcon /> : <FilterListIcon />
        }
      >
        Advanced Filtering
      </Button>
      <Collapse
        className={classes.collapse}
        orientation="vertical"
        in={showOptionalFilters}
        unmountOnExit
      >
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            <PrefilterUser disabled={disabled} isDm={isDm} />
            <BeforeAndAfterFields disabled={disabled} />
          </Stack>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={1}
          >
            <MessageContains disabled={disabled} />
            <HasType disabled={disabled} />
          </Stack>
        </Stack>
      </Collapse>
    </Stack>
  );
}

export default AdvancedFiltering;
