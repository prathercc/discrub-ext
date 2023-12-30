import React, { useState, useRef } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getGuildIcon } from "../../components/Messages/ChannelMessages/ChannelMessages";
import ClearIcon from "@mui/icons-material/Clear";
import { useDispatch, useSelector } from "react-redux";
import { changeGuild, selectGuild } from "../../features/guild/guildSlice";
import {
  changeChannel,
  selectChannel,
} from "../../features/channel/channelSlice";
import {
  getMessageData,
  selectMessage,
} from "../../features/message/messageSlice";
import { selectApp } from "../../features/app/appSlice";
import { getSafeExportName, sortByProperty } from "../../utils";
import BeforeAndAfterFields from "../../components/Messages/BeforeAndAfterFields/BeforeAndAfterFields";
import PauseButton from "../../components/PauseButton/PauseButton";
import CancelButton from "../../components/Messages/CancelButton/CancelButton";
import { selectUser } from "../../features/user/userSlice";
import TokenNotFound from "../../components/Messages/TokenNotFound/TokenNotFound";
import TagsStyles from "./Tags.styles";
import Papa from "papaparse";
import { Tag, getTagName } from "../../enum/Tag";
import { format } from "date-fns";
import {
  getSpecialFormatting,
  selectExport,
} from "../../features/export/exportSlice";
import SkipReplies from "./components/SkipReplies";

function Tags() {
  const classes = TagsStyles();
  const dispatch = useDispatch();

  const { guilds, selectedGuild } = useSelector(selectGuild);
  const { channels, selectedChannel } = useSelector(selectChannel);
  const {
    isLoading: messagesLoading,
    searchBeforeDate,
    searchAfterDate,
    fetchProgress,
    totalSearchMessages,
    lookupUserId,
  } = useSelector(selectMessage);
  const { discrubCancelled } = useSelector(selectApp);
  const { token, isLoading: userLoading } = useSelector(selectUser);
  const { exportMaps } = useSelector(selectExport);
  const { userMap } = exportMaps;

  // TODO: Create a tagSlice, so that we don't need to do this!
  const userMapRef = useRef();
  userMapRef.current = userMap;

  const { messageCount } = fetchProgress || {};

  const [anchorEl, setAnchorEl] = useState(null);
  const [noTagsFound, setNoTagsFound] = useState(false);
  const [skipReplies, setSkipReplies] = useState(true);

  const pauseCancelDisabled = !messagesLoading;
  const guildFieldDisabled = messagesLoading || discrubCancelled;
  const channelFieldDisabled =
    selectedGuild.id === null || messagesLoading || discrubCancelled;
  const generateBtnDisabled =
    !selectedGuild.id ||
    messagesLoading ||
    !selectedChannel.id ||
    !searchBeforeDate ||
    !searchAfterDate ||
    discrubCancelled;

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

  const downloadCsv = (content = [], type = Tag.TAGS_MADE_BY_USER) => {
    const dateFormat = "MMM do yyyy";
    const fileName = `${selectedGuild.getName()} ${selectedChannel.getName()} ${format(
      searchAfterDate,
      dateFormat
    )} to ${format(searchBeforeDate, dateFormat)} ${getTagName(type)}.csv`;

    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(Papa.unparse(content))
    );
    element.setAttribute("download", getSafeExportName(fileName));
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleGenerate = async (type = Tag.TAGS_MADE_BY_USER) => {
    setAnchorEl(null);
    let { messages } = await dispatch(
      getMessageData(selectedGuild.id, selectedChannel.id)
    );
    let mentionMap = {};

    if (skipReplies) {
      messages = messages.filter((message) => !message.isReply());
    }

    if (type === Tag.TAGS_MADE_BY_USER) {
      messages.forEach((message) => {
        const { userMention } = dispatch(getSpecialFormatting(message.content));
        const author = message.getAuthor();
        const guildNickName =
          userMapRef.current[author.getUserId()]?.guilds[selectedGuild.getId()]
            ?.nick;

        const displayName =
          guildNickName || author.getDisplayName() || author.getUserName();
        const tagCount = Number(userMention?.length || 0);
        if (Boolean(tagCount)) {
          mentionMap[displayName] =
            Number(mentionMap[displayName] || 0) + tagCount;
        }
      });
    } else if (type === Tag.TAGGED_USERS) {
      messages.forEach((message) => {
        const { userMention } = dispatch(getSpecialFormatting(message.content));
        if (Boolean(userMention?.length)) {
          userMention.forEach((mention) => {
            const { id: userId, userName } = mention;
            const guildNickName =
              userMapRef.current[userId]?.guilds[selectedGuild.getId()]?.nick;

            const displayName = guildNickName || userName;
            mentionMap[displayName] = Number(mentionMap[displayName] || 0) + 1;
          });
        }
      });
    }

    if (Boolean(Object.keys(mentionMap)?.length)) {
      const csvData = Object.keys(mentionMap).map((key) => ({
        "Display Name": key,
        [getTagName(type)]: mentionMap[key],
      }));
      downloadCsv(csvData, type);
    } else {
      setNoTagsFound(true);
    }
  };

  const handleGuildChange = async (id) => {
    dispatch(changeGuild(id));
  };

  const handleChannelChange = async (id) => {
    dispatch(changeChannel(id));
  };

  const getProgressText = () => {
    if (lookupUserId) {
      return `User Lookup: ${lookupUserId}`;
    }
    if (messageCount > 0) {
      return `Fetched ${messageCount} of ${totalSearchMessages} Messages`;
    }
  };

  return (
    <>
      {token && (
        <Paper className={classes.paper}>
          <Stack spacing={1}>
            <Stack
              justifyContent="center"
              alignItems="flex-start"
              direction="column"
              spacing={1}
            >
              <Typography variant="body1">Tags</Typography>
              <Typography variant="caption">
                Retrieve tag data for a Channel in a given period
              </Typography>
            </Stack>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={1}
              className={classes.container}
            >
              <Autocomplete
                clearIcon={<ClearIcon />}
                onChange={(_, val) => handleGuildChange(val)}
                options={sortedGuilds.map((guild) => {
                  return guild.getId();
                })}
                getOptionLabel={(id) =>
                  guilds.find((guild) => guild.getId() === id)?.getName()
                }
                renderOption={(params, id) => {
                  const foundGuild = guilds.find(
                    (guild) => guild.getId() === id
                  );
                  return (
                    <Typography gap="4px" {...params}>
                      {getGuildIcon(foundGuild)}
                      {foundGuild?.getName()}
                    </Typography>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    fullWidth
                    size="small"
                    label="Server"
                    className={classes.autocomplete}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          {selectedGuild.getId() && getGuildIcon(selectedGuild)}
                        </>
                      ),
                    }}
                  />
                )}
                value={selectedGuild?.getId()}
                disabled={guildFieldDisabled}
              />

              <Autocomplete
                clearIcon={<ClearIcon />}
                onChange={(_, val) => handleChannelChange(val)}
                options={sortedChannels.map((channel) => {
                  return channel.getId();
                })}
                getOptionLabel={(id) =>
                  channels
                    .find((channel) => channel.getId() === id)
                    ?.getName() || ""
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    fullWidth
                    size="small"
                    label="Channel"
                    className={classes.autocomplete}
                  />
                )}
                value={selectedChannel?.getId()}
                disabled={channelFieldDisabled}
              />
            </Stack>
            <BeforeAndAfterFields
              disabled={messagesLoading}
              afterProps={{
                toolTipTitle: "Tags Starting From",
                toolTipDescription:
                  "Time that tag collection should start from",
                label: "Tags Starting From",
              }}
              beforeProps={{
                toolTipTitle: "Tags Ending On",
                toolTipDescription: "Time that tag collection should end on",
                label: "Tags Ending On",
              }}
            />
            <SkipReplies
              messagesLoading={messagesLoading}
              setSkipReplies={setSkipReplies}
              skipReplies={skipReplies}
            />

            <Stack
              alignItems="center"
              direction="row"
              spacing={1}
              justifyContent="flex-end"
            >
              <PauseButton disabled={pauseCancelDisabled} />

              <Button
                disabled={generateBtnDisabled}
                onClick={({ currentTarget }) => setAnchorEl(currentTarget)}
                variant="contained"
              >
                Generate Spreadsheet
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem
                  dense
                  onClick={() => handleGenerate(Tag.TAGS_MADE_BY_USER)}
                >
                  {getTagName(Tag.TAGS_MADE_BY_USER)}
                </MenuItem>
                <MenuItem
                  dense
                  onClick={() => handleGenerate(Tag.TAGGED_USERS)}
                >
                  {getTagName(Tag.TAGGED_USERS)}
                </MenuItem>
              </Menu>

              <CancelButton disabled={pauseCancelDisabled} />
            </Stack>
          </Stack>
        </Paper>
      )}

      {messagesLoading && (
        <Paper justifyContent="center" className={classes.paper}>
          <Box className={classes.progressBox}>
            <CircularProgress />
            <Typography variant="caption">{getProgressText()}</Typography>
          </Box>
        </Paper>
      )}
      {!token && !userLoading && <TokenNotFound />}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
        open={noTagsFound}
        onClose={() => {
          setNoTagsFound(false);
        }}
      >
        <Alert severity="warning">
          <span>No Tags Found!</span>
        </Alert>
      </Snackbar>
    </>
  );
}

export default Tags;
