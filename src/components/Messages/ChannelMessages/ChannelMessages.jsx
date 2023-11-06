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
} from "@mui/material";
import ChannelMessagesStyles from "./Styles/ChannelMessages.styles";
import PurgeButton from "../../Purge/PurgeButton/PurgeButton";
import ExportButton from "../../Export/ExportButton/ExportButton";
import AdvancedFiltering from "../AdvancedFiltering/AdvancedFiltering";
import TokenNotFound from "../TokenNotFound/TokenNotFound";
import { sortByProperty } from "../../../utils";
import classNames from "classnames";
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

function ChannelMessages({ closeAnnouncement }) {
  const dispatch = useDispatch();
  const { token, isLoading: userLoading } = useSelector(selectUser);
  const { guilds, selectedGuild } = useSelector(selectGuild);
  const { channels, selectedChannel, preFilterUserId } =
    useSelector(selectChannel);
  const {
    messages,
    isLoading: messagesLoading,
    fetchedMessageLength,
    lookupUserId,
    searchBeforeDate,
    searchAfterDate,
    searchMessageContent,
    selectedHasTypes,
  } = useSelector(selectMessage);

  const [showOptionalFilters, setShowOptionalFilters] = useState(false);
  const [searchTouched, setSearchTouched] = useState(false);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const classes = ChannelMessagesStyles({
    purgeDialogOpen,
    exportDialogOpen,
    showOptionalFilters,
  });

  const fetchChannelData = async () => {
    dispatch(
      getMessageData(selectedGuild.id, selectedChannel.id, preFilterUserId)
    );
    setSearchTouched(true);
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

  const guildFieldDisabled = messagesLoading || purgeDialogOpen;
  const channelFieldDisabled = selectedGuild.id === null || messagesLoading;
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

  return (
    <Stack spacing={2} className={classes.boxContainer}>
      {token && guilds && (
        <Stack spacing={2}>
          <Paper className={classes.paper}>
            <Stack spacing={2}>
              <Stack>
                <Typography variant="body1">Channel Messages</Typography>
              </Stack>

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
                    return guild.id;
                  })}
                  getOptionLabel={(id) =>
                    guilds.find((guild) => guild.id === id)?.name
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="filled"
                      fullWidth
                      size="small"
                      label="Guild"
                      onFocus={closeAnnouncement}
                      className={classes.autocomplete}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <CopyAdornment
                            copyValue={sortedGuilds
                              .map((guild) => guild.name)
                              .join("\r\n")}
                            copyName="Guild List"
                            disabled={guildFieldDisabled}
                          />
                        ),
                      }}
                    />
                  )}
                  value={selectedGuild?.id}
                  disabled={guildFieldDisabled}
                />

                <Autocomplete
                  clearIcon={<ClearIcon />}
                  onChange={(_, val) => handleChannelChange(val)}
                  options={sortedChannels.map((channel) => {
                    return channel.id;
                  })}
                  getOptionLabel={(id) =>
                    channels.find((channel) => channel.id === id)?.name
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="filled"
                      fullWidth
                      size="small"
                      label="Channel"
                      className={classNames(
                        classes.autocomplete,
                        classes.purgeHidden
                      )}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <CopyAdornment
                            copyValue={sortedChannels
                              .map((channel) => channel.name)
                              .join("\r\n")}
                            copyName="Channel List"
                            disabled={channelFieldDisabled}
                          />
                        ),
                      }}
                    />
                  )}
                  value={selectedChannel?.id}
                  disabled={channelFieldDisabled}
                />
              </Stack>

              <span className={classes.purgeHidden}>
                <AdvancedFiltering
                  closeAnnouncement={closeAnnouncement}
                  setShowOptionalFilters={setShowOptionalFilters}
                  showOptionalFilters={showOptionalFilters}
                />
              </span>

              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                justifyContent="flex-end"
              >
                <span className={purgeDialogOpen && classes.purgeHidden}>
                  <ExportButton
                    bulk
                    dialogOpen={exportDialogOpen}
                    setDialogOpen={setExportDialogOpen}
                  />
                </span>
                <span className={exportDialogOpen && classes.purgeHidden}>
                  <PurgeButton
                    dialogOpen={purgeDialogOpen}
                    setDialogOpen={setPurgeDialogOpen}
                  />
                </span>
                <span className={classes.purgeHidden}>
                  <PauseButton disabled={!messagesLoading} />
                </span>
                <Button
                  className={classes.purgeHidden}
                  disabled={
                    !selectedGuild.id ||
                    messagesLoading ||
                    (!advancedFilterActive && !selectedChannel.id)
                  }
                  onClick={fetchChannelData}
                  variant="contained"
                >
                  Search
                </Button>
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
                <Typography variant="caption">
                  {lookupUserId && `User Lookup: ${lookupUserId}`}
                  {!lookupUserId &&
                    fetchedMessageLength > 0 &&
                    `Fetched ${fetchedMessageLength} Messages`}
                  {!lookupUserId &&
                    fetchedMessageLength <= 0 &&
                    "Fetching Data"}
                </Typography>
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
