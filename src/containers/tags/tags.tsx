import { useState, useRef, useEffect } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import {
  getSafeExportName,
  messageTypeEquals,
  sortByProperty,
} from "../../utils";
import BeforeAndAfterFields from "../../components/before-and-after-fields";
import PauseButton from "../../components/pause-button";
import CancelButton from "../../components/cancel-button";
import TokenNotFound from "../../components/token-not-found";
import Papa from "papaparse";
import { Tag, getTagName } from "../../enum/tag";
import { format } from "date-fns";
import SkipReplies from "./components/skip-replies";
import { useGuildSlice } from "../../features/guild/use-guild-slice";
import { useChannelSlice } from "../../features/channel/use-channel-slice";
import { useMessageSlice } from "../../features/message/use-message-slice";
import { useAppSlice } from "../../features/app/use-app-slice";
import { useUserSlice } from "../../features/user/use-user-slice";
import { useExportSlice } from "../../features/export/use-export-slice";
import { ExportUserMap } from "../../features/export/export-types";
import { MessageType } from "../../enum/message-type";
import Channel from "../../classes/channel";
import Guild from "../../classes/guild";
import EntityIcon from "../../components/entity-icon";

function Tags() {
  const { state: guildState, changeGuild, getGuilds } = useGuildSlice();
  const selectedGuild = guildState.selectedGuild();
  const guilds = guildState.guilds();

  const { state: channelState, changeChannel } = useChannelSlice();
  const channels = channelState.channels();
  const selectedChannel = channelState.selectedChannel();

  const { state: messageState, getMessageData } = useMessageSlice();
  const messagesLoading = messageState.isLoading();
  const searchCriteria = messageState.searchCriteria();
  const { searchBeforeDate, searchAfterDate } = searchCriteria;

  const { state: appState } = useAppSlice();
  const discrubCancelled = appState.discrubCancelled();
  const task = appState.task();
  const { statusText } = task || {};

  const { state: userState } = useUserSlice();
  const token = userState.token();
  const userLoading = userState.isLoading();

  const { state: exportState, getSpecialFormatting } = useExportSlice();
  const userMap = exportState.userMap();

  // TODO: Create a tagSlice, so that we don't need to do this!
  const userMapRef = useRef<ExportUserMap | Maybe>();
  userMapRef.current = userMap;

  const [anchorEl, setAnchorEl] = useState<
    (EventTarget & HTMLButtonElement) | Maybe
  >(null);
  const [noTagsFound, setNoTagsFound] = useState(false);
  const [skipReplies, setSkipReplies] = useState(true);

  const pauseCancelDisabled = !messagesLoading;
  const guildFieldDisabled = messagesLoading || discrubCancelled;
  const channelFieldDisabled =
    selectedGuild?.id === null || messagesLoading || discrubCancelled;
  const generateBtnDisabled =
    !selectedGuild?.id ||
    messagesLoading ||
    !selectedChannel?.id ||
    !searchBeforeDate ||
    !searchAfterDate ||
    discrubCancelled;

  const sortedGuilds = guilds
    .map((g) => new Guild({ ...g }))
    .sort((a, b) =>
      sortByProperty(
        { name: a.name.toLowerCase() },
        { name: b.name.toLowerCase() },
        "name",
      ),
    );
  const sortedChannels = channels
    .map((c) => new Channel({ ...c }))
    .sort((a, b) =>
      sortByProperty(
        { name: String(a.name).toLowerCase() },
        { name: String(b.name).toLowerCase() },
        "name",
      ),
    );

  const downloadCsv = (
    content: unknown[] = [],
    type = Tag.TAGS_MADE_BY_USER,
  ) => {
    if (!generateBtnDisabled) {
      const dateFormat = "MMM do yyyy";
      const fileName = `${selectedGuild.name} ${selectedChannel.name} ${format(
        searchAfterDate,
        dateFormat,
      )} to ${format(searchBeforeDate, dateFormat)} ${getTagName(type)}.csv`;

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," +
          encodeURIComponent(Papa.unparse(content)),
      );
      element.setAttribute("download", getSafeExportName(fileName));
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  type MentionMap = {
    [name: string]: number;
  };

  const handleGenerate = async (type = Tag.TAGS_MADE_BY_USER) => {
    if (!generateBtnDisabled && userMapRef.current) {
      setAnchorEl(null);
      let { messages } = (await getMessageData(
        selectedGuild.id,
        selectedChannel.id,
        { excludeReactions: true },
      )) || { messages: [] };
      const mentionMap: MentionMap = {};

      if (skipReplies) {
        messages = messages.filter(
          (message) => !messageTypeEquals(message.type, MessageType.REPLY),
        );
      }

      if (type === Tag.TAGS_MADE_BY_USER) {
        messages.forEach((message) => {
          if (userMapRef.current) {
            const { userMention } = getSpecialFormatting(message.content);
            const author = message.author;
            const guildNickName =
              userMapRef.current[author.id]?.guilds[selectedGuild.id]?.nick;

            const displayName =
              guildNickName || author.global_name || author.username;
            const tagCount = Number(userMention?.length || 0);
            if (tagCount) {
              mentionMap[displayName] =
                Number(mentionMap[displayName] || 0) + tagCount;
            }
          }
        });
      } else if (type === Tag.TAGGED_USERS) {
        messages.forEach((message) => {
          const { userMention } = getSpecialFormatting(message.content);
          if (userMention?.length) {
            userMention.forEach((mention) => {
              if (userMapRef.current) {
                const { id: userId, userName } = mention;
                const guildNickName =
                  userMapRef.current[userId]?.guilds[selectedGuild.id]?.nick;

                const displayName = guildNickName || userName;
                mentionMap[displayName] =
                  Number(mentionMap[displayName] || 0) + 1;
              }
            });
          }
        });
      }

      if (Object.keys(mentionMap)?.length) {
        const csvData: unknown[] = Object.keys(mentionMap).map((key) => ({
          "Display Name": key,
          [getTagName(type)]: mentionMap[key],
        }));
        downloadCsv(csvData, type);
      } else {
        setNoTagsFound(true);
      }
    }
  };

  const handleGuildChange = async (id: Snowflake | null) => {
    changeGuild(id);
  };

  const handleChannelChange = async (id: Snowflake | null) => {
    changeChannel(id);
  };

  useEffect(() => {
    if (token) getGuilds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <>
      {token && (
        <Paper sx={{ padding: "10px", margin: "10px 10px 0px 10px" }}>
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
              sx={{
                padding: "15px",
                maxHeight: "85%",
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              <Autocomplete
                clearIcon={<ClearIcon />}
                onChange={(_, val) => handleGuildChange(val)}
                options={sortedGuilds.map((guild) => {
                  return guild.id;
                })}
                getOptionLabel={(id) =>
                  String(guilds.find((guild) => guild.id === id)?.name)
                }
                renderOption={(params, id) => {
                  const foundGuild = guilds.find((guild) => guild.id === id);
                  return (
                    <Typography gap="4px" {...params}>
                      {foundGuild ? (
                        <>
                          <EntityIcon entity={foundGuild} />
                          {foundGuild.name}
                        </>
                      ) : null}
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
                    sx={{ width: "330px !important" }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          {selectedGuild && (
                            <EntityIcon entity={selectedGuild} />
                          )}
                        </>
                      ),
                    }}
                  />
                )}
                value={selectedGuild?.id}
                disabled={guildFieldDisabled}
              />

              <Autocomplete
                clearIcon={<ClearIcon />}
                onChange={(_, val) => handleChannelChange(val)}
                options={sortedChannels.map((channel) => {
                  return channel.id;
                })}
                getOptionLabel={(id) =>
                  channels.find((channel) => channel.id === id)?.name || ""
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    fullWidth
                    size="small"
                    label="Channel"
                    sx={{ width: "330px !important" }}
                  />
                )}
                value={selectedChannel?.id}
                disabled={channelFieldDisabled}
              />
            </Stack>
            <BeforeAndAfterFields
              disabled={Boolean(messagesLoading)}
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
              messagesLoading={Boolean(messagesLoading)}
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
        <Paper
          sx={{
            justifyContent: "center",
            padding: "10px",
            margin: "10px 10px 0px 10px",
          }}
        >
          <Box
            sx={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              marginTop: "1vh",
              flexDirection: "column",
            }}
          >
            <LinearProgress sx={{ width: "100%", m: 1 }} />
            <Typography variant="caption">{statusText}</Typography>
          </Box>
        </Paper>
      )}
      {!token && !userLoading && <TokenNotFound />}
      {/* {!token && <TokenNotFound />} */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
        open={noTagsFound}
        onClose={() => {
          setNoTagsFound(false);
        }}
      >
        <Alert variant="filled" severity="warning">
          <span>No Tags Found!</span>
        </Alert>
      </Snackbar>
    </>
  );
}

export default Tags;
