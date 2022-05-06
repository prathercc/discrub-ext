import React, { useState, useEffect, useRef, useContext } from "react";
import { fetchDirectMessages, fetchMessageData } from "../../discordService";
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

function DirectMessages() {
  const { state: userState } = useContext(UserContext);
  const { token } = userState;

  const [directMessages, setDirectMessages] = useState(null);
  const [selectedDirectMessage, setSelectedDirectMessage] = useState(null);
  const [messageData, setMessageData] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [numOfMessagesFetched, setNumOfMessagesFetched] = useState(0);

  const mountedRef = useRef(false);

  const boxSx = {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    marginTop: "1vh",
  };

  useEffect(() => {
    const getDirectMessages = async () => {
      try {
        const data = await fetchDirectMessages(token);
        setDirectMessages(data);
      } catch (e) {
        console.error("Error fetching DM's");
        setDirectMessages([]);
      }
    };
    if (token) getDirectMessages();
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const getAllMessages = async () => {
      setMessageData(null);
      setFetchingData(true);
      let lastId = "";
      let reachedEnd = false;
      let retArr = [];
      while (!reachedEnd && mountedRef.current) {
        const data = await fetchMessageData(
          token,
          lastId,
          selectedDirectMessage
        );
        if (data.length < 100) {
          reachedEnd = true;
        }
        if (data.length > 0) {
          lastId = data[data.length - 1].id;
        }
        if (data && (data[0]?.content || data[0]?.attachments)) {
          retArr = retArr.concat(data);
          setNumOfMessagesFetched(retArr.length);
        }
      }
      setNumOfMessagesFetched(0);
      setMessageData(retArr);
      setFetchingData(false);
    };

    if (selectedDirectMessage) {
      getAllMessages();
    }
  }, [selectedDirectMessage]);

  return (
    <Box
      sx={{
        padding: "15px",
        maxHeight: "85%",
        maxWidth: "100%",
        overflow: "auto",
      }}
    >
      <Paper sx={{ padding: "10px" }}>
        {token && directMessages && (
          <>
            <Typography variant="h5">Your Direct Messages</Typography>
            <Typography variant="caption">
              Messages between other Discord users and yourself.
            </Typography>
            <TextField
              fullWidth
              variant="filled"
              disabled={fetchingData}
              value={selectedDirectMessage}
              onChange={(e) => setSelectedDirectMessage(e.target.value)}
              sx={{ my: "5px" }}
              select
              label="Direct Messages"
            >
              {directMessages.map((directMessage) => {
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
          </>
        )}

        {(!token || !directMessages || fetchingData) && (
          <>
            <Stack justifyContent="center" alignItems="center">
              <CircularProgress />
            </Stack>
            <Box sx={boxSx}>
              <Typography variant="caption">
                {numOfMessagesFetched > 0
                  ? `Fetched ${numOfMessagesFetched} Messages`
                  : "Fetching Data"}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
      {messageData && messageData.length > 0 && !fetchingData && (
        <DMTable
          rows={messageData}
          exportTitle={() => {
            const directMessage = directMessages.find(
              (directMessage) => directMessage.id === selectedDirectMessage
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
      )}
      {messageData && messageData.length === 0 && !fetchingData && (
        <Paper sx={{ padding: "10px" }}>
          <Box sx={boxSx}>
            <Typography>No Messages to Display</Typography>
          </Box>
          <Box sx={boxSx}>
            <Typography>
              <SentimentDissatisfiedIcon />
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

const DMTable = ({ rows, exportTitle }) => {
  const [refactoredData, setRefactoredData] = useState(null);

  useEffect(() => {
    const refactorData = async () => {
      let retArr = [];
      await rows.forEach((x) =>
        retArr.push({
          username: x.author.username,
          ...x,
        })
      );
      setRefactoredData(retArr);
    };
    refactorData();
  }, []);

  return (
    <>
      {refactoredData && (
        <DiscordTable
          exportTitle={exportTitle}
          rows={refactoredData}
          setRefactoredData={setRefactoredData}
        />
      )}
    </>
  );
};

export default DirectMessages;
