import React, { useEffect, useContext, useState } from "react";
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
  Button,
  Tooltip,
} from "@mui/material";
import { UserContext } from "../../context/user/UserContext";
import { DmContext } from "../../context/dm/DmContext";
import { MessageContext } from "../../context/message/MessageContext";
import DirectMessagesStyles from "./DirectMessages.styles";

function DirectMessages() {
  const classes = DirectMessagesStyles();

  const [searchTouched, setSearchTouched] = useState(false);
  const { state: userState } = useContext(UserContext);
  const {
    state: dmState,
    getDms,
    setDm,
    setPreFilterUserId,
  } = useContext(DmContext);
  const {
    state: messageState,
    resetMessageData,
    getMessageData,
  } = useContext(MessageContext);

  const { selectedDm, dms, preFilterUserId, preFilterUserIds } = dmState;
  const {
    fetchedMessageLength,
    isLoading: messagesLoading,
    messages,
  } = messageState;
  const { token } = userState;

  const fetchDmData = async () => {
    await resetMessageData();
    await getMessageData(selectedDm.id);
    setSearchTouched(true);
  };

  useEffect(() => {
    getDms();
  }, [getDms]);

  return (
    <Stack spacing={2} className={classes.boxContainer}>
      {token && dms && (
        <Stack spacing={2}>
          <Paper className={classes.paper}>
            <Stack spacing={2}>
              <Stack>
                <Typography variant="h5">Direct Messages</Typography>
                <Typography variant="caption">
                  Messages between other Discord users and yourself.
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
                <Tooltip
                  title="Filtering by username is optional"
                  placement="top"
                >
                  <TextField
                    fullWidth
                    variant="filled"
                    disabled={selectedDm.id === null || messagesLoading}
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
                <Button
                  disabled={selectedDm.id === null || messagesLoading}
                  onClick={() => selectedDm.id && fetchDmData()}
                  variant="contained"
                >
                  Search
                </Button>
              </Stack>
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
          <DiscordTable />
        </Box>
      )}
      {messages?.length === 0 &&
        !messagesLoading &&
        selectedDm.id &&
        searchTouched && (
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
