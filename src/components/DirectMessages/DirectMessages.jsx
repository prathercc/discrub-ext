import React, { useState, useEffect, useRef } from "react";
import { fetchDirectMessages, fetchMessageData } from "../../discordService";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import DiscordTextField from "../DiscordComponents/DiscordTextField/DiscordTextField";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";
import DiscordSpinner from "../DiscordComponents/DiscordSpinner/DiscordSpinner";
import DiscordTable from "../DiscordComponents/DiscordTable/DiscordTable";
import DiscordPaper from "../DiscordComponents/DiscordPaper/DiscordPaper";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import { Typography } from "@mui/material";

function DirectMessages({ userData }) {
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
        const data = await fetchDirectMessages(userData.token);
        setDirectMessages(data);
      } catch (e) {
        console.error("Error fetching DM's");
        setDirectMessages([]);
      }
    };
    if (userData && userData.token) getDirectMessages();
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
          userData.token,
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
      <DiscordPaper>
        {userData && directMessages && (
          <>
            <DiscordTypography variant="h5">
              Your Direct Messages
            </DiscordTypography>
            <DiscordTypography variant="caption">
              Messages between other Discord users and yourself.
            </DiscordTypography>
            <DiscordTextField
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
            </DiscordTextField>
          </>
        )}

        {(!userData || !directMessages || fetchingData) && (
          <>
            <DiscordSpinner />
            <Box sx={boxSx}>
              <DiscordTypography variant="caption">
                {numOfMessagesFetched > 0
                  ? `Fetched ${numOfMessagesFetched} Messages`
                  : "Fetching Data"}
              </DiscordTypography>
            </Box>
          </>
        )}
      </DiscordPaper>
      {messageData && messageData.length > 0 && !fetchingData && (
        <DMTable
          rows={messageData}
          userData={userData}
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
        <DiscordPaper>
          <Box sx={boxSx}>
            <DiscordTypography>No Messages to Display</DiscordTypography>
          </Box>
          <Box sx={boxSx}>
            <DiscordTypography>
              <SentimentDissatisfiedIcon />
            </DiscordTypography>
          </Box>
        </DiscordPaper>
      )}
    </Box>
  );
}

const DMTable = ({ rows, userData, exportTitle }) => {
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
          userData={userData}
          setRefactoredData={setRefactoredData}
        />
      )}
    </>
  );
};

export default DirectMessages;
