import React, { useEffect, useContext, useState } from "react";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import DiscordTable from "../DiscordComponents/DiscordTable/DiscordTable";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import {
  Stack,
  Typography,
  Paper,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";
import { UserContext } from "../../context/user/UserContext";
import { GuildContext } from "../../context/guild/GuildContext";
import { ChannelContext } from "../../context/channel/ChannelContext";
import { MessageContext } from "../../context/message/MessageContext";
import ChannelMessagesStyles from "./ChannelMessages.styles";
import PurgeButton from "../Buttons/PurgeButton";
import ExportButton from "../Buttons/ExportButton/ExportButton";
import AdvancedFiltering from "../AdvancedFiltering/AdvancedFiltering";
import TokenNotFound from "../TokenNotFound/TokenNotFound";

function ChannelMessages({ closeAnnouncement }) {
  const {
    state: messageDataState,
    getMessageData,
    resetMessageData,
    resetFilters,
    setSearchBeforeDate,
    setSearchAfterDate,
  } = useContext(MessageContext);
  const { state: userState } = useContext(UserContext);
  const { state: guildState, getGuilds, setGuild } = useContext(GuildContext);
  const {
    state: channelState,
    getChannels,
    setChannel,
    resetChannel,
    setPreFilterUserId,
  } = useContext(ChannelContext);

  const [showOptionalFilters, setShowOptionalFilters] = useState(false);
  const [searchTouched, setSearchTouched] = useState(false);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const classes = ChannelMessagesStyles({
    purgeDialogOpen,
    exportDialogOpen,
    showOptionalFilters,
  });

  const { token } = userState;
  const { guilds, selectedGuild } = guildState;
  const { channels, selectedChannel } = channelState;
  const {
    messages,
    isLoading: messagesLoading,
    fetchedMessageLength,
  } = messageDataState;

  const fetchChannelData = async () => {
    await resetMessageData();
    await getMessageData(selectedChannel.id);
    setSearchTouched(true);
  };

  const handleGuildChange = async (e) => {
    setGuild(e.target.value);
    await resetChannel();
    await resetFilters();
    await setSearchBeforeDate(null);
    await setSearchAfterDate(null);
    await resetMessageData();
    await getChannels(e.target.value);
    setSearchTouched(false);
  };

  const handleChannelChange = async (e) => {
    if (!e.target.value) {
      await setPreFilterUserId(null);
      await setSearchBeforeDate(null);
      await setSearchAfterDate(null);
    }
    await resetFilters();
    await resetMessageData();
    setSearchTouched(false);
    setChannel(e.target.value);
  };

  useEffect(() => {
    if (purgeDialogOpen || exportDialogOpen) {
      setShowOptionalFilters(false);
    }
  }, [purgeDialogOpen, exportDialogOpen]);

  useEffect(() => {
    if (token) getGuilds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Stack spacing={2} className={classes.boxContainer}>
      {token && guilds && (
        <Stack spacing={2}>
          <Paper className={classes.paper}>
            <Stack spacing={2}>
              <Stack>
                <Typography variant="h5">Channel Messages</Typography>
                <Typography variant="caption">
                  Messages between other Discord users and yourself, within
                  Guilds.
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <TextField
                  size="small"
                  fullWidth
                  variant="filled"
                  disabled={messagesLoading || purgeDialogOpen}
                  value={selectedGuild.id}
                  onChange={handleGuildChange}
                  select
                  label="Guilds"
                  onFocus={closeAnnouncement}
                >
                  {guilds.map((guild) => {
                    return (
                      <MenuItem dense key={guild.id} value={guild.id}>
                        {guild.name}
                      </MenuItem>
                    );
                  })}
                </TextField>

                <TextField
                  size="small"
                  className={classes.purgeHidden}
                  fullWidth
                  variant="filled"
                  disabled={selectedGuild.id === null || messagesLoading}
                  value={selectedChannel.id}
                  onChange={handleChannelChange}
                  select
                  label="Channels"
                >
                  <MenuItem dense value={null} key={-1}>
                    <strong>Reset Selection</strong>
                  </MenuItem>
                  {channels.map((channel) => {
                    return (
                      <MenuItem dense key={channel.id} value={channel.id}>
                        {channel.name}
                      </MenuItem>
                    );
                  })}
                </TextField>
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
                <Button
                  className={classes.purgeHidden}
                  disabled={selectedChannel.id === null || messagesLoading}
                  onClick={() => selectedChannel.id && fetchChannelData()}
                  variant="contained"
                >
                  Search
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {messages.length > 0 &&
            !messagesLoading &&
            !purgeDialogOpen &&
            !exportDialogOpen && (
              <Box className={classes.tableBox}>
                <DiscordTable />
              </Box>
            )}
          {messages.length === 0 &&
            !messagesLoading &&
            selectedChannel.id &&
            searchTouched &&
            !purgeDialogOpen &&
            !exportDialogOpen && (
              <Paper className={classes.paper}>
                <Box className={classes.box}>
                  <Typography>No Messages to Display</Typography>
                </Box>
                <Box className={classes.box}>
                  <Typography>
                    <SentimentDissatisfiedIcon />
                  </Typography>
                </Box>
              </Paper>
            )}
        </Stack>
      )}
      {token !== undefined &&
        (token === null || !guilds.length || messagesLoading) &&
        !purgeDialogOpen &&
        !exportDialogOpen && (
          <Paper justifyContent="center" className={classes.paper}>
            <Stack justifyContent="center" alignItems="center">
              <CircularProgress />
            </Stack>
            <Box className={classes.box}>
              <Typography variant="caption">
                {fetchedMessageLength > 0
                  ? `Fetched ${fetchedMessageLength} Messages`
                  : "Fetching Data"}
              </Typography>
            </Box>
          </Paper>
        )}
      <TokenNotFound />
    </Stack>
  );
}

export default ChannelMessages;
