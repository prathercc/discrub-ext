import React, { useContext } from "react";
import { Stack, Button, Collapse } from "@mui/material";
import { MessageContext } from "../../../context/message/MessageContext";
import { DmContext } from "../../../context/dm/DmContext";
import AdvancedFilteringStyles from "./AdvancedFiltering.styles";
import BeforeAndAfterFields from "../BeforeAndAfterFields/BeforeAndAfterFields";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import PrefilterUser from "../PrefilterUser/PrefilterUser";
import MessageContains from "../MessageContains/MessageContains";
import { GuildContext } from "../../../context/guild/GuildContext";
import HasType from "../HasType/HasType";

function AdvancedFiltering({
  closeAnnouncement = () => {},
  isDm = false,
  setShowOptionalFilters,
  showOptionalFilters,
}) {
  const { state: guildState } = useContext(GuildContext);
  const { state: messageDataState } = useContext(MessageContext);
  const { state: dmState } = useContext(DmContext);

  const classes = AdvancedFilteringStyles();

  const { selectedGuild } = guildState;
  const { isLoading: messagesLoading } = messageDataState;
  const { selectedDm } = dmState;

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
