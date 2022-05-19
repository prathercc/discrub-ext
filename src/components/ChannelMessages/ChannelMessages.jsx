import React, { useEffect, useContext } from "react";
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
} from "@mui/material";
import { UserContext } from "../../context/user/UserContext";
import { GuildContext } from "../../context/guild/GuildContext";
import { ChannelContext } from "../../context/channel/ChannelContext";
import { MessageContext } from "../../context/message/MessageContext";
import ChannelMessagesStyles from "./ChannelMessages.styles";

function ChannelMessages() {
  const classes = ChannelMessagesStyles();
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
  } = useContext(ChannelContext);

  const { token } = userState;
  const { guilds, selectedGuild } = guildState;
  const { channels, selectedChannel } = channelState;
  const {
    messages,
    isLoading: messagesLoading,
    fetchedMessageLength,
  } = messageDataState;

  useEffect(() => {
    const fetchChannelData = async () => {
      await resetMessageData();
      await getMessageData(selectedChannel.id);
    };
    if (selectedChannel.id) fetchChannelData();
  }, [selectedChannel.id, getMessageData, resetMessageData]);

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
                <Typography variant="h5">Your Channel Messages</Typography>
                <Typography variant="caption">
                  Messages between other Discord users and yourself, within
                  Guilds.
                </Typography>
              </Stack>
              <TextField
                fullWidth
                variant="filled"
                disabled={messagesLoading}
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
                fullWidth
                variant="filled"
                disabled={selectedGuild.id === null || messagesLoading}
                value={selectedChannel.id}
                onChange={(e) => setChannel(e.target.value)}
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
            </Stack>
          </Paper>

          {messages.length > 0 && !messagesLoading && (
            <Box className={classes.tableBox}>
              <DiscordTable />
            </Box>
          )}
          {messages.length === 0 && !messagesLoading && selectedChannel.id && (
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
      {(!token || !guilds.length || messagesLoading) && (
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
