import React, { useEffect, useContext } from "react";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import DiscordTable from "../DiscordComponents/DiscordTable/DiscordTable";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import {
  Typography,
  Paper,
  Stack,
  CircularProgress,
  TextField,
} from "@mui/material";
import { UserContext } from "../../context/user/UserContext";
import { DmContext } from "../../context/dm/DmContext";
import { MessageContext } from "../../context/message/MessageContext";
import DirectMessagesStyles from "./DirectMessages.styles";

function DirectMessages() {
  const classes = DirectMessagesStyles();

  const { state: userState } = useContext(UserContext);
  const { state: dmState, getDms, setDm } = useContext(DmContext);
  const {
    state: messageState,
    resetMessageData,
    getMessageData,
  } = useContext(MessageContext);

  const { selectedDm, dms } = dmState;
  const {
    fetchedMessageLength,
    isLoading: messagesLoading,
    messages,
  } = messageState;
  const { token } = userState;

  useEffect(() => {
    getDms();
  }, [getDms]);

  useEffect(() => {
    const fetchDmData = async () => {
      await resetMessageData();
      await getMessageData(selectedDm.id);
    };
    if (selectedDm.id) fetchDmData();
  }, [selectedDm.id, getMessageData, resetMessageData]);

  return (
    <Stack spacing={2} className={classes.boxContainer}>
      {token && dms && (
        <Stack spacing={2}>
          <Paper className={classes.paper}>
            <Stack spacing={2}>
              <Stack>
                <Typography variant="h5">Your Direct Messages</Typography>
                <Typography variant="caption">
                  Messages between other Discord users and yourself.
                </Typography>
              </Stack>
              <TextField
                fullWidth
                variant="filled"
                disabled={messagesLoading}
                value={selectedDm.id}
                onChange={(e) => setDm(e.target.value)}
                select
                label="Direct Messages"
              >
                {dms.map((directMessage) => {
                  return (
                    <MenuItem key={directMessage.id} value={directMessage.id}>
                      {directMessage.recipients.length === 1
                        ? directMessage.recipients[0].username
                        : directMessage.name
                        ? `Group Chat - ${directMessage.name}`
                        : `Unnamed Group Chat - ${directMessage.id}`}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Stack>
          </Paper>
        </Stack>
      )}

      {(!token || !dms || messagesLoading) && (
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

      {messages?.length > 0 && !messagesLoading && (
        <Box className={classes.tableBox}>
          <DiscordTable
            exportTitle={() => {
              const directMessage = dms.find(
                (directMessage) => directMessage.id === selectedDm.id
              );
              return (
                <Typography variant="h4">
                  {directMessage.recipients.length === 1
                    ? directMessage.recipients[0].username
                    : directMessage.name
                    ? `Group Chat - ${directMessage.name}`
                    : `Unnamed Group Chat - ${directMessage.id}`}
                </Typography>
              );
            }}
          />
        </Box>
      )}
      {messages?.length === 0 && !messagesLoading && selectedDm.id && (
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
  );
}

export default DirectMessages;
