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
  Tooltip,
} from "@mui/material";
import { UserContext } from "../../context/user/UserContext";
import { GuildContext } from "../../context/guild/GuildContext";
import { ChannelContext } from "../../context/channel/ChannelContext";
import { MessageContext } from "../../context/message/MessageContext";
import ChannelMessagesStyles from "./ChannelMessages.styles";
import PurgeGuild from "./PurgeGuild";

function ChannelMessages() {
  const {
    state: messageDataState,
    getMessageData,
    resetMessageData,
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

  const [searchTouched, setSearchTouched] = useState(false);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const classes = ChannelMessagesStyles({ purgeDialogOpen });

  const { token } = userState;
  const { guilds, selectedGuild } = guildState;
  const { channels, selectedChannel, preFilterUserIds, preFilterUserId } =
    channelState;
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

  useEffect(() => {
    const fetchGuildChannels = async () => {
      await resetChannel();
      await resetMessageData();
      await getChannels(selectedGuild.id);
    };
    if (selectedGuild.id) fetchGuildChannels();
  }, [getChannels, selectedGuild.id, resetMessageData, resetChannel]);

  useEffect(() => {
    getGuilds();
  }, [getGuilds]);

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
                  fullWidth
                  variant="filled"
                  disabled={messagesLoading || purgeDialogOpen}
                  value={selectedGuild.id}
                  onChange={(e) => setGuild(e.target.value)}
                  select
                  label="Guilds"
                >
                  {guilds.map((guild) => {
                    return (
                      <MenuItem key={guild.id} value={guild.id}>
                        {guild.name}
                      </MenuItem>
                    );
                  })}
                </TextField>

                <TextField
                  className={classes.purgeHidden}
                  fullWidth
                  variant="filled"
                  disabled={selectedGuild.id === null || messagesLoading}
                  value={selectedChannel.id}
                  onChange={(e) => {
                    setSearchTouched(false);
                    setChannel(e.target.value);
                  }}
                  select
                  label="Channels"
                >
                  {channels.map((channel) => {
                    return (
                      <MenuItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </MenuItem>
                    );
                  })}
                </TextField>

                <Tooltip
                  title="Filtering by username is optional"
                  placement="top"
                >
                  <TextField
                    fullWidth
                    variant="filled"
                    disabled={selectedChannel.id === null || messagesLoading}
                    value={preFilterUserId}
                    onChange={(e) => setPreFilterUserId(e.target.value)}
                    select
                    label="Filter By Username"
                  >
                    <MenuItem value={null} key={-1}>
                      <strong>Reset Selection</strong>
                    </MenuItem>
                    {preFilterUserIds.map((user) => {
                      return (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      );
                    })}
                  </TextField>
                </Tooltip>
              </Stack>

              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                justifyContent="flex-end"
              >
                <PurgeGuild
                  dialogOpen={purgeDialogOpen}
                  setDialogOpen={setPurgeDialogOpen}
                />
                <Button
                  disabled={selectedChannel.id === null || messagesLoading}
                  onClick={() => selectedChannel.id && fetchChannelData()}
                  variant="contained"
                >
                  Search
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {messages.length > 0 && !messagesLoading && !purgeDialogOpen && (
            <Box className={classes.tableBox}>
              <DiscordTable />
            </Box>
          )}
          {messages.length === 0 &&
            !messagesLoading &&
            selectedChannel.id &&
            searchTouched &&
            !purgeDialogOpen && (
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
      {(!token || !guilds.length || messagesLoading) && !purgeDialogOpen && (
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
    </Stack>
  );
}

export default ChannelMessages;
