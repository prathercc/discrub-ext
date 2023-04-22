import React, { useContext } from "react";
import { Stack, Button, Collapse } from "@mui/material";
import { ChannelContext } from "../../context/channel/ChannelContext";
import { MessageContext } from "../../context/message/MessageContext";
import { DmContext } from "../../context/dm/DmContext";
import AdvancedFilteringStyles from "./AdvancedFiltering.styles";
import BeforeAndAfterFields from "../Fields/BeforeAndAfterFields";
import PrefilterUser from "./PrefilterUser";

function AdvancedFiltering({
  closeAnnouncement = () => {},
  isDm = false,
  setShowOptionalFilters,
  showOptionalFilters,
}) {
  const { state: messageDataState } = useContext(MessageContext);
  const { state: channelState } = useContext(ChannelContext);
  const { state: dmState } = useContext(DmContext);

  const classes = AdvancedFilteringStyles();

  const { selectedChannel } = channelState;
  const { isLoading: messagesLoading } = messageDataState;
  const { selectedDm } = dmState;

  const handleFilterButtonClick = () => {
    closeAnnouncement();
    setShowOptionalFilters(!showOptionalFilters);
  };

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
      >
        {showOptionalFilters ? "Hide" : "Show"} Advanced Filtering
      </Button>
      <Collapse orientation="vertical" in={showOptionalFilters}>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
          <PrefilterUser isDm={isDm} />
          <BeforeAndAfterFields
            disabled={
              (isDm ? selectedDm : selectedChannel).id === null ||
              messagesLoading
            }
          />
        </Stack>
      </Collapse>
    </Stack>
  );
}

export default AdvancedFiltering;
