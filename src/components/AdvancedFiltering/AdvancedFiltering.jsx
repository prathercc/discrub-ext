import React, { useContext } from "react";
import MenuItem from "@mui/material/MenuItem";
import { Stack, TextField, Button, Collapse } from "@mui/material";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { ChannelContext } from "../../context/channel/ChannelContext";
import { MessageContext } from "../../context/message/MessageContext";
import { DmContext } from "../../context/dm/DmContext";
import AdvancedFilteringStyles from "./AdvancedFiltering.styles";
import BeforeAndAfterFields from "../Fields/BeforeAndAfterFields";

function AdvancedFiltering({
  closeAnnouncement = () => {},
  isDm = false,
  setShowOptionalFilters,
  showOptionalFilters,
}) {
  const { state: messageDataState } = useContext(MessageContext);
  const { state: channelState, setPreFilterUserId } =
    useContext(ChannelContext);
  const { state: dmState, setPreFilterUserId: setDmPrefilterUserId } =
    useContext(DmContext);

  const classes = AdvancedFilteringStyles({ showOptionalFilters });

  const { selectedChannel, preFilterUserIds, preFilterUserId } = channelState;
  const { isLoading: messagesLoading } = messageDataState;
  const {
    selectedDm,
    preFilterUserId: dmPreFilterUserId,
    preFilterUserIds: dmPreFilterUserIds,
  } = dmState;

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
          <Tooltip
            arrow
            title="Filter By Username"
            description="Due to API limitations, Channel Messages can only be pre-filtered by your username"
            placement="top"
          >
            <TextField
              className={classes.filterByUserName}
              size="small"
              fullWidth
              variant="filled"
              disabled={
                (isDm ? selectedDm : selectedChannel).id === null ||
                messagesLoading
              }
              value={isDm ? dmPreFilterUserId : preFilterUserId}
              onChange={(e) =>
                isDm
                  ? setDmPrefilterUserId(e.target.value)
                  : setPreFilterUserId(e.target.value)
              }
              select
              label="Filter By Username"
            >
              <MenuItem dense value={null} key={-1}>
                <strong>Reset Selection</strong>
              </MenuItem>
              {(isDm ? dmPreFilterUserIds : preFilterUserIds).map((user) => {
                return (
                  <MenuItem dense key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                );
              })}
            </TextField>
          </Tooltip>
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
