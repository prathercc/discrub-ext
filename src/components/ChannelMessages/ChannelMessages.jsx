import React, { useState, useEffect, useRef, useContext } from "react";
import {
  fetchGuilds,
  fetchChannels,
  fetchMessageData,
} from "../../discordService";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import DiscordTextField from "../DiscordComponents/DiscordTextField/DiscordTextField";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";
import DiscordSpinner from "../DiscordComponents/DiscordSpinner/DiscordSpinner";
import DiscordTable from "../DiscordComponents/DiscordTable/DiscordTable";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import DiscordPaper from "../DiscordComponents/DiscordPaper/DiscordPaper";
import { Typography } from "@mui/material";
import { UserContext } from "../../context/user/UserContext";

function ChannelMessages() {
  const { state: userState } = useContext(UserContext);
  const { token } = userState;

  const [guilds, setGuilds] = useState(null);
  const [channels, setChannels] = useState(null);
  const [selectedGuild, setSelectedGuild] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [messageData, setMessageData] = useState(null);
  const [numOfMessagesFetched, setNumOfMessagesFetched] = useState(0);
  const mountedRef = useRef(false);

  const boxSx = {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    marginTop: "1vh",
  };

  useEffect(() => {
    const getMessages = async () => {
      try {
        setFetchingData(true);
        let lastId = "";
        let reachedEnd = false;
        let retArr = [];
        while (!reachedEnd && mountedRef.current) {
          const data = await fetchMessageData(token, lastId, selectedChannel);
          if (data.message && data.message.includes("Missing Access")) {
            break;
          }
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
      } catch (e) {
        console.error("Error fetching channel messages");
      } finally {
        setFetchingData(false);
      }
    };
    setMessageData(null);
    if (selectedChannel) getMessages();
  }, [selectedChannel]);

  useEffect(() => {
    const getChannels = async () => {
      try {
        setFetchingData(true);
        let data = await fetchChannels(token, selectedGuild);
        if (Array.isArray(data)) setChannels(data);
      } catch (e) {
        console.error("Error fetching channels");
      } finally {
        setFetchingData(false);
      }
    };
    setSelectedChannel(null);
    setMessageData(null);
    if (selectedGuild) getChannels();
  }, [selectedGuild]);

  useEffect(() => {
    const getGuilds = async () => {
      try {
        setMessageData(null);
        setFetchingData(true);
        let data = await fetchGuilds(token);
        if (Array.isArray(data)) setGuilds(data);
      } catch (e) {
        console.error("Error fetching guilds.");
      } finally {
        setFetchingData(false);
      }
    };
    if (token) getGuilds();
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <Box
      sx={{
        padding: "15px",
        maxHeight: "85%",
        maxWidth: "100%",
        overflow: "auto",
      }}
    >
      {token && guilds && (
        <>
          <DiscordPaper>
            <DiscordTypography variant="h5">
              Your Channel Messages
            </DiscordTypography>
            <DiscordTypography variant="caption">
              Messages between other Discord users and yourself, within Guilds.
            </DiscordTypography>
            <DiscordTextField
              disabled={fetchingData}
              value={selectedGuild}
              onChange={(e) => setSelectedGuild(e.target.value)}
              sx={{ my: "5px" }}
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
            </DiscordTextField>
            <DiscordTextField
              disabled={selectedGuild === null || fetchingData}
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              sx={{ my: "5px" }}
              select
              label="Channels"
            >
              {channels &&
                channels.map((channel) => {
                  return (
                    <MenuItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </MenuItem>
                  );
                })}
            </DiscordTextField>
          </DiscordPaper>
          {messageData && messageData.length > 0 && !fetchingData && (
            <ChannelMsgTable
              rows={messageData}
              exportTitle={() => (
                <>
                  <Typography variant="h4">
                    {guilds.find((guild) => guild.id === selectedGuild)?.name}
                  </Typography>
                  <Typography variant="h6">
                    {
                      channels.find((channel) => channel.id === selectedChannel)
                        ?.name
                    }
                  </Typography>
                </>
              )}
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
        </>
      )}
      {(!token || !guilds || fetchingData) && (
        <DiscordPaper>
          <DiscordSpinner />
          <Box sx={boxSx}>
            <DiscordTypography variant="caption">
              {numOfMessagesFetched > 0
                ? `Fetched ${numOfMessagesFetched} Messages`
                : "Fetching Data"}
            </DiscordTypography>
          </Box>
        </DiscordPaper>
      )}
    </Box>
  );
}

const ChannelMsgTable = ({ rows, exportTitle }) => {
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

export default ChannelMessages;
