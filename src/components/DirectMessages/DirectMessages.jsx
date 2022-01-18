import React, { useState, useEffect } from "react";
import { fetchDirectMessages, fetchMessageData } from "../../discordService";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import DiscordTextField from "../DiscordComponents/DiscordTextField/DiscordTextField";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";
import DiscordSpinner from "../DiscordComponents/DiscordSpinner/DiscordSpinner";
import DiscordTable from "../DiscordComponents/DiscordTable/DiscordTable";

function DirectMessages({ userData }) {
  const [directMessages, setDirectMessages] = useState(null);
  const [selectedDirectMessage, setSelectedDirectMessage] = useState(null);

  const [messageData, setMessageData] = useState(null);

  const [fetchingData, setFetchingData] = useState(false);

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
  }, []);

  useEffect(() => {
    const getAllMessages = async () => {
      setMessageData(null);
      setFetchingData(true);
      let lastId = "";
      let reachedEnd = false;
      let retArr = [];
      while (!reachedEnd) {
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
        if (data && (data[0]?.content || data[0]?.attachments))
          retArr = retArr.concat(data);
      }
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
      {(!userData || !directMessages || fetchingData) && <DiscordSpinner />}
      {messageData && !fetchingData && (
        <DMTable rows={messageData} userData={userData} />
      )}
    </Box>
  );
}

const DMTable = ({ rows, userData }) => {
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
          rows={refactoredData}
          userData={userData}
          setRefactoredData={setRefactoredData}
        />
      )}
    </>
  );
};

export default DirectMessages;
