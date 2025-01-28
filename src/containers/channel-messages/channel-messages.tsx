import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Table, {
  OrderProps,
  TableColumn,
  TableRow,
} from "../../common-components/table/table";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Autocomplete,
  Button,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PurgeButton from "../purge-button/purge-button";
import ExportButton from "../export-button/export-button";
import TokenNotFound from "../../components/token-not-found";
import {
  getSortedChannels,
  getSortedGuilds,
  isCriteriaActive,
  isRemovableMessage,
} from "../../utils";
import CopyAdornment from "../../components/copy-adornment";
import PauseButton from "../../components/pause-button";
import CancelButton from "../../components/cancel-button";
import Tooltip from "../../common-components/tooltip/tooltip";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useUserSlice } from "../../features/user/use-user-slice";
import { useGuildSlice } from "../../features/guild/use-guild-slice";
import { useChannelSlice } from "../../features/channel/use-channel-slice";
import { useMessageSlice } from "../../features/message/use-message-slice";
import { useAppSlice } from "../../features/app/use-app-slice";
import EntityIcon from "../../components/entity-icon";
import Message from "../../classes/message";
import { SortDirection } from "../../enum/sort-direction";
import TableMessage from "../../components/table-message";
import AttachmentModal from "../../components/attachment-modal";
import EmbedModal from "../../components/embed-modal";
import MessageTableToolbar from "../message-table-toolbar/message-table-toolbar";
import ReactionModal from "../../components/reaction-modal";
import SearchCriteria, {
  SearchCriteriaComponentType,
} from "../search-criteria/search-criteria.tsx";

function ChannelMessages() {
  const { state: userState } = useUserSlice();
  const userLoading = userState.isLoading();
  const token = userState.token();

  const { state: guildState, changeGuild, getGuilds } = useGuildSlice();
  const guilds = guildState.guilds();
  const selectedGuild = guildState.selectedGuild();

  const { state: channelState, changeChannel, loadChannel } = useChannelSlice();
  const channels = channelState.channels();
  const selectedChannel = channelState.selectedChannel();

  const {
    state: messageState,
    getMessageData,
    setOrder,
    deleteAttachment,
    setSelected,
    deleteReaction,
  } = useMessageSlice();
  const messages = messageState.messages();
  const messagesLoading = messageState.isLoading();
  const searchCriteria = messageState.searchCriteria();
  const filters = messageState.filters();
  const filteredMessages = messageState.filteredMessages();
  const selectedMessages = messageState.selectedMessages();

  const { state: appState, setModifyEntity } = useAppSlice();
  const discrubCancelled = appState.discrubCancelled();
  const task = appState.task();
  const settings = appState.settings();

  const { statusText } = task || {};

  const [searchTouched, setSearchTouched] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [reactionModalOpen, setReactionModalOpen] = useState(false);

  const columns: TableColumn<Message>[] = [
    {
      id: "timestamp",
      disablePadding: true,
      label: "Date",
    },
    {
      id: "userName",
      disablePadding: true,
      label: "Username",
    },
    {
      id: "content",
      disablePadding: false,
      label: "Message",
    },
  ];

  const rows: TableRow<Message>[] = (
    filters.length ? filteredMessages : messages
  ).map((m) => ({
    data: m,
    selectable: isRemovableMessage(m),
    renderRow: (row) => (
      <TableMessage
        settings={settings}
        row={row}
        setModifyEntity={setModifyEntity}
        openAttachmentModal={() => setAttachmentModalOpen(true)}
        openEmbedModal={() => setEmbedModalOpen(true)}
        openReactionModal={() => setReactionModalOpen(true)}
      />
    ),
  }));

  const orderProps: OrderProps<Message> = {
    order: SortDirection.DESCENDING,
    orderBy: "timestamp",
    onRequestSort: (order, orderBy) => {
      setOrder({ order, orderBy });
    },
  };

  const fetchChannelData = () => {
    getMessageData(selectedGuild?.id, selectedChannel?.id);
    setSearchTouched(true);
    setExpanded(false);
  };

  const handleGuildChange = (id: Snowflake | null) => {
    changeGuild(id);
    setSearchTouched(false);
  };

  const handleChannelChange = (id: Snowflake | null) => {
    changeChannel(id);
    setSearchTouched(false);
  };

  const pauseCancelDisabled = !messagesLoading;
  const guildFieldDisabled = messagesLoading || discrubCancelled;
  const channelFieldDisabled =
    selectedGuild?.id === null || messagesLoading || discrubCancelled;
  const searchBtnDisabled =
    !selectedGuild?.id ||
    messagesLoading ||
    (!isCriteriaActive(searchCriteria) && !selectedChannel?.id) ||
    discrubCancelled;
  const purgeDisabled = Boolean(
    !selectedGuild?.id ||
      messagesLoading ||
      selectedChannel?.id ||
      messages.length > 0 ||
      discrubCancelled,
  );
  const exportDisabled = Boolean(
    !selectedGuild?.id ||
      messagesLoading ||
      selectedChannel?.id ||
      messages.length > 0 ||
      discrubCancelled,
  );

  const sortedGuilds = getSortedGuilds(guilds);
  const sortedChannels = getSortedChannels(channels);

  useEffect(() => {
    if (token) getGuilds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Stack
      spacing={2}
      sx={{
        padding: "15px",
        maxHeight: "85%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <ReactionModal
        task={task}
        handleClose={() => setReactionModalOpen(false)}
        open={reactionModalOpen}
        handleReactionDelete={deleteReaction}
      />
      <AttachmentModal
        task={task}
        onDeleteAttachment={deleteAttachment}
        handleClose={() => setAttachmentModalOpen(false)}
        open={attachmentModalOpen}
      />
      <EmbedModal
        task={task}
        handleClose={() => setEmbedModalOpen(false)}
        open={embedModalOpen}
      />
      {token && guilds && (
        <Stack spacing={2}>
          <Paper sx={{ padding: "10px" }}>
            <Stack spacing={2}>
              <Stack
                justifyContent="space-between"
                alignItems="center"
                direction="row"
              >
                <Typography variant="body1">Channel Messages</Typography>
                <Tooltip title={expanded ? "Collapse" : "Expand"}>
                  <IconButton
                    onClick={() => {
                      setExpanded(!expanded);
                    }}
                    color="secondary"
                  >
                    {expanded ? <RemoveIcon /> : <AddIcon />}
                  </IconButton>
                </Tooltip>
              </Stack>

              <Collapse orientation="vertical" in={expanded}>
                <Stack direction="column" gap="5px" spacing={1}>
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={1}
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
                        const foundGuild = guilds.find(
                          (guild) => guild.id === id,
                        );
                        return (
                          <Typography gap="4px" {...params}>
                            {foundGuild && <EntityIcon entity={foundGuild} />}
                            {foundGuild?.name}
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
                                <CopyAdornment
                                  copyValue={sortedGuilds
                                    .map((guild) => guild.name)
                                    .join("\r\n")}
                                  copyName="Server List"
                                  disabled={guildFieldDisabled}
                                />
                                {selectedGuild?.id && (
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
                      onPaste={async (e) => {
                        e.preventDefault();
                        if (selectedGuild) {
                          const clipboardData = e.clipboardData.getData("text");
                          loadChannel(clipboardData);
                        }
                      }}
                      options={sortedChannels.map((channel) => {
                        return channel.id;
                      })}
                      getOptionLabel={(id) =>
                        channels.find((channel) => channel.id === id)?.name ||
                        ""
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="filled"
                          fullWidth
                          size="small"
                          label="Channel"
                          sx={{ width: "330px !important" }}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <CopyAdornment
                                copyValue={sortedChannels
                                  .map((channel) => channel.name)
                                  .join("\r\n")}
                                copyName="Channel List"
                                disabled={channelFieldDisabled}
                              />
                            ),
                          }}
                        />
                      )}
                      value={selectedChannel?.id}
                      disabled={channelFieldDisabled}
                    />
                  </Stack>

                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-end"
                    spacing={1}
                  >
                    <SearchCriteria
                      componentType={SearchCriteriaComponentType.Button}
                    />
                  </Stack>
                </Stack>
              </Collapse>
              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                justifyContent="flex-end"
              >
                <ExportButton bulk disabled={exportDisabled} />
                <PurgeButton disabled={purgeDisabled} />
                <PauseButton disabled={pauseCancelDisabled} />
                <Button
                  disabled={searchBtnDisabled}
                  onClick={fetchChannelData}
                  variant="contained"
                >
                  Search
                </Button>
                <CancelButton disabled={pauseCancelDisabled} />
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      )}
      <>
        {!messagesLoading && (
          <>
            {messages.length > 0 && (
              <Box sx={{ maxHeight: "430px", overflow: "auto" }}>
                <Table
                  stickyControl
                  columns={columns}
                  rows={rows}
                  orderProps={orderProps}
                  selectedRows={selectedMessages}
                  renderToolbarComponent={(selectedRows) => (
                    <MessageTableToolbar selectedRows={selectedRows} />
                  )}
                  setSelectedRows={setSelected}
                />
              </Box>
            )}
            {messages.length === 0 && selectedGuild?.id && searchTouched && (
              <Paper sx={{ padding: "10px" }}>
                <Box
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    marginTop: "1vh",
                    flexDirection: "column",
                  }}
                >
                  <SentimentDissatisfiedIcon />
                  <Typography>No Messages to Display</Typography>
                </Box>
              </Paper>
            )}
          </>
        )}
        {(userLoading || messagesLoading) && (
          <Paper sx={{ justifyContent: "center", padding: "10px" }}>
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
      </>
    </Stack>
  );
}

export default ChannelMessages;
