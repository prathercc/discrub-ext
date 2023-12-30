import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import DiscordTable from "../../DiscordComponents/DiscordTable/DiscordTable";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Stack,
  Typography,
  Paper,
  CircularProgress,
  TextField,
  Button,
  Autocomplete,
  IconButton,
  Collapse,
} from "@mui/material";
import ChannelMessagesStyles from "./Styles/ChannelMessages.styles";
import PurgeButton from "../../Purge/PurgeButton/PurgeButton";
import ExportButton from "../../Export/ExportButton/ExportButton";
import AdvancedFiltering from "../AdvancedFiltering/AdvancedFiltering";
import TokenNotFound from "../TokenNotFound/TokenNotFound";
import { sortByProperty } from "../../../utils";
import CopyAdornment from "../CopyAdornment/CopyAdornment";
import PauseButton from "../../PauseButton/PauseButton";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../../features/user/userSlice";
import {
  changeGuild,
  getGuilds,
  selectGuild,
} from "../../../features/guild/guildSlice";
import {
  changeChannel,
  selectChannel,
} from "../../../features/channel/channelSlice";
import {
  getMessageData,
  selectMessage,
} from "../../../features/message/messageSlice";
import CancelButton from "../CancelButton/CancelButton";
import { selectApp } from "../../../features/app/appSlice";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DiscordTooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";

export const getGuildIcon = (guild) => {
  return (
    <img
      style={{ width: "24px", height: "24px", borderRadius: "50px" }}
      src={guild.getIconUrl()}
      alt="guild-icon"
    />
  );
};

function ChannelMessages({ closeAnnouncement }) {
  const dispatch = useDispatch();
  const { token, isLoading: userLoading } = useSelector(selectUser);
  const { guilds, selectedGuild, preFilterUserId } = useSelector(selectGuild);
  const { channels, selectedChannel } = useSelector(selectChannel);
  const {
    messages,
    isLoading: messagesLoading,
    fetchProgress,
    lookupUserId,
    searchBeforeDate,
    searchAfterDate,
    searchMessageContent,
    selectedHasTypes,
    totalSearchMessages,
  } = useSelector(selectMessage);
  const { discrubCancelled } = useSelector(selectApp);

  const { messageCount, threadCount, parsingThreads } = fetchProgress || {};

  const [showOptionalFilters, setShowOptionalFilters] = useState(false);
  const [searchTouched, setSearchTouched] = useState(false);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const classes = ChannelMessagesStyles();

  const fetchChannelData = async () => {
    dispatch(
      getMessageData(selectedGuild.id, selectedChannel.id, preFilterUserId)
    );
    setSearchTouched(true);
    setExpanded(false);
  };

  const handleGuildChange = async (id) => {
    dispatch(changeGuild(id));
    setSearchTouched(false);
  };

  const handleChannelChange = async (id) => {
    dispatch(changeChannel(id));
    setSearchTouched(false);
  };

  const advancedFilterActive = [
    preFilterUserId,
    searchBeforeDate,
    searchAfterDate,
    searchMessageContent,
    selectedHasTypes.length,
  ].some((c) => c);

  const pauseCancelDisabled = !messagesLoading;
  const guildFieldDisabled = messagesLoading || discrubCancelled;
  const channelFieldDisabled =
    selectedGuild.id === null || messagesLoading || discrubCancelled;
  const searchBtnDisabled =
    !selectedGuild.id ||
    messagesLoading ||
    (!advancedFilterActive && !selectedChannel.id) ||
    discrubCancelled;
  const exportAndPurgeDisabled =
    !selectedGuild.id ||
    messagesLoading ||
    selectedChannel.id ||
    messages.length > 0 ||
    advancedFilterActive ||
    discrubCancelled;

  const sortedGuilds = guilds.toSorted((a, b) =>
    sortByProperty(
      { name: a.name.toLowerCase() },
      { name: b.name.toLowerCase() },
      "name"
    )
  );
  const sortedChannels = channels.toSorted((a, b) =>
    sortByProperty(
      { name: a.name.toLowerCase() },
      { name: b.name.toLowerCase() },
      "name"
    )
  );

  useEffect(() => {
    if (purgeDialogOpen || exportDialogOpen) {
      setShowOptionalFilters(false);
    }
  }, [purgeDialogOpen, exportDialogOpen]);

  useEffect(() => {
    if (token) dispatch(getGuilds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getProgressText = () => {
    return (
      <>
        {parsingThreads && <>Fetched {threadCount} Threads</>}
        {!parsingThreads && (
          <>
            {lookupUserId && `User Lookup: ${lookupUserId}`}
            {!lookupUserId &&
              messageCount > 0 &&
              `Fetched ${messageCount}${
                Boolean(totalSearchMessages) ? ` of ${totalSearchMessages}` : ""
              } Messages
                
              `}
            {!lookupUserId && messageCount <= 0 && "Fetching Data"}
          </>
        )}
      </>
    );
  };

  return (
    <Stack spacing={2} className={classes.boxContainer}>
      {token && guilds && (
        <Stack spacing={2}>
          <Paper className={classes.paper}>
            <Stack spacing={2}>
              <Stack
                justifyContent="space-between"
                alignItems="center"
                direction="row"
              >
                <Typography variant="body1">Channel Messages</Typography>
                <DiscordTooltip title={expanded ? "Collapse" : "Expand"}>
                  <IconButton
                    onClick={(e) => {
                      setExpanded(!expanded);
                    }}
                    color="secondary"
                  >
                    {expanded ? <RemoveIcon /> : <AddIcon />}
                  </IconButton>
                </DiscordTooltip>
              </Stack>

              <Collapse orientation="vertical" in={expanded}>
                <Stack direction="column" gap="5px">
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={1}
                  >
                    <Autocomplete
                      clearIcon={<ClearIcon />}
                      onChange={(_, val) => handleGuildChange(val)}
                      options={sortedGuilds.map((guild) => {
                        return guild.getId();
                      })}
                      getOptionLabel={(id) =>
                        guilds.find((guild) => guild.getId() === id)?.getName()
                      }
                      renderOption={(params, id) => {
                        const foundGuild = guilds.find(
                          (guild) => guild.getId() === id
                        );
                        return (
                          <Typography gap="4px" {...params}>
                            {getGuildIcon(foundGuild)}
                            {foundGuild?.getName()}
                          </Typography>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="filled"
                          fullWidth
                          size="small"
                          label="Server"
                          onFocus={closeAnnouncement}
                          className={classes.autocomplete}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <CopyAdornment
                                  copyValue={sortedGuilds
                                    .map((guild) => guild.getName())
                                    .join("\r\n")}
                                  copyName="Server List"
                                  disabled={guildFieldDisabled}
                                />
                                {selectedGuild.getId() &&
                                  getGuildIcon(selectedGuild)}
                              </>
                            ),
                          }}
                        />
                      )}
                      value={selectedGuild?.getId()}
                      disabled={guildFieldDisabled}
                    />

                    <Autocomplete
                      clearIcon={<ClearIcon />}
                      onChange={(_, val) => handleChannelChange(val)}
                      options={sortedChannels.map((channel) => {
                        return channel.getId();
                      })}
                      getOptionLabel={(id) =>
                        channels
                          .find((channel) => channel.getId() === id)
                          ?.getName() || ""
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="filled"
                          fullWidth
                          size="small"
                          label="Channel"
                          className={classes.autocomplete}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <CopyAdornment
                                copyValue={sortedChannels
                                  .map((channel) => channel.getName())
                                  .join("\r\n")}
                                copyName="Channel List"
                                disabled={channelFieldDisabled}
                              />
                            ),
                          }}
                        />
                      )}
                      value={selectedChannel?.getId()}
                      disabled={channelFieldDisabled}
                    />
                  </Stack>

                  <AdvancedFiltering
                    closeAnnouncement={closeAnnouncement}
                    setShowOptionalFilters={setShowOptionalFilters}
                    showOptionalFilters={showOptionalFilters}
                  />
                </Stack>
              </Collapse>
              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                justifyContent="flex-end"
              >
                <ExportButton
                  bulk
                  disabled={exportAndPurgeDisabled}
                  dialogOpen={exportDialogOpen}
                  setDialogOpen={setExportDialogOpen}
                />

                <PurgeButton
                  disabled={exportAndPurgeDisabled}
                  dialogOpen={purgeDialogOpen}
                  setDialogOpen={setPurgeDialogOpen}
                />

                <PauseButton disabled={pauseCancelDisabled} />

                <Button
                  disabled={searchBtnDisabled}
                  onClick={fetchChannelData}
                  variant="contained"
                >
                  Search
                </Button>

                <CancelButton disabled={pauseCancelDisabled} />
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      )}
      {!purgeDialogOpen && !exportDialogOpen && (
        <>
          {!messagesLoading && (
            <>
              {messages.length > 0 && (
                <Box className={classes.tableBox}>
                  <DiscordTable />
                </Box>
              )}
              {messages.length === 0 && selectedGuild.id && searchTouched && (
                <Paper className={classes.paper}>
                  <Box className={classes.box}>
                    <SentimentDissatisfiedIcon />
                    <Typography>No Messages to Display</Typography>
                  </Box>
                </Paper>
              )}
            </>
          )}
          {(userLoading || messagesLoading) && (
            <Paper justifyContent="center" className={classes.paper}>
              <Box className={classes.box}>
                <CircularProgress />
                <Typography variant="caption">{getProgressText()}</Typography>
              </Box>
            </Paper>
          )}
          {!token && !userLoading && <TokenNotFound />}
        </>
      )}
    </Stack>
  );
}

export default ChannelMessages;
