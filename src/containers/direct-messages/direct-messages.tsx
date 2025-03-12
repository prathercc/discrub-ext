import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Table, {
  OrderProps,
  TableColumn,
  TableRow,
} from "../../common-components/table/table";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import {
  Button,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ExportButton from "../export-button/export-button";
import PurgeButton from "../purge-button/purge-button";
import TokenNotFound from "../../components/token-not-found";
import { getIconUrl, sortByProperty } from "../../utils";
import PauseButton from "../../components/pause-button";
import CancelButton from "../../components/cancel-button";
import Tooltip from "../../common-components/tooltip/tooltip";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useUserSlice } from "../../features/user/use-user-slice";
import { useDmSlice } from "../../features/dm/use-dm-slice";
import { useMessageSlice } from "../../features/message/use-message-slice";
import { useAppSlice } from "../../features/app/use-app-slice";
import Channel from "../../classes/channel";
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
import EnhancedAutocomplete from "../../common-components/enhanced-autocomplete/enhanced-autocomplete.tsx";

function DirectMessages() {
  const { state: userState } = useUserSlice();
  const token = userState.token();
  const userLoading = userState.isLoading();

  const { state: dmState, getDms, setSelectedDms } = useDmSlice();
  const selectedDms = dmState.selectedDms();
  const dms = dmState.dms();

  const {
    state: messageState,
    getMessageData,
    setOrder,
    deleteAttachment,
    setSelected,
    deleteReaction,
    resetAdvancedFilters,
  } = useMessageSlice();
  const messagesLoading = messageState.isLoading();
  const messages = messageState.messages();
  const selectedMessages = messageState.selectedMessages();
  const filters = messageState.filters();
  const filteredMessages = messageState.filteredMessages();

  const { state: appState, setModifyEntity } = useAppSlice();
  const discrubCancelled = appState.discrubCancelled();
  const task = appState.task();
  const settings = appState.settings();

  const [searchTouched, setSearchTouched] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [reactionModalOpen, setReactionModalOpen] = useState(false);

  const { statusText } = task || {};

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
    selectable: true,
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

  const fetchDmData = async () => {
    getMessageData(null, selectedDms[0].id);
    setSearchTouched(true);
    setExpanded(false);
  };

  const handleChangeDm = (ids: Snowflake[]) => {
    setSelectedDms(ids);
    setSearchTouched(false);
    if (ids.length > 1) {
      resetAdvancedFilters();
    }
  };

  const handleSelectAll = () => {
    if (selectedDms.length !== dms.length) {
      setSelectedDms(dms.map((c) => c.id));
    } else {
      setSelectedDms([]);
    }
  };

  const sortedDms = dms
    .map((d) => new Channel({ ...d }))
    .sort((a, b) =>
      sortByProperty(
        { name: String(a.name).toLowerCase() },
        { name: String(b.name).toLowerCase() },
        "name",
      ),
    );

  const dmFieldDisabled = messagesLoading || discrubCancelled;
  const searchDisabled =
    selectedDms.length !== 1 || messagesLoading || discrubCancelled;
  const pauseCancelDisabled = !messagesLoading;
  const exportAndPurgeDisabled =
    selectedDms.length === 0 ||
    messagesLoading ||
    messages.length > 0 ||
    discrubCancelled;

  useEffect(() => {
    if (token) getDms();
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
      {token && dms && (
        <Stack spacing={2}>
          <Paper sx={{ padding: "10px" }}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Direct Messages</Typography>
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
                    <EnhancedAutocomplete
                      label="DM"
                      multiple
                      options={sortedDms.map((c) => c.id)}
                      getOptionLabel={(id) =>
                        dms.find((c) => c.id === id)?.name || ""
                      }
                      value={selectedDms.map((dm) => dm.id)}
                      disabled={dmFieldDisabled}
                      onChange={(value) => {
                        if (Array.isArray(value)) {
                          handleChangeDm(value);
                        }
                      }}
                      copyValue={sortedDms.map((dm) => dm.name).join("\r\n")}
                      copyName="DM List"
                      getOptionIconSrc={(id) => {
                        const dm = dms.find((c) => c.id === id);
                        return dm && getIconUrl(dm);
                      }}
                      onSelectAll={handleSelectAll}
                    />
                  </Stack>
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-end"
                    spacing={1}
                  >
                    <SearchCriteria
                      isDm
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
                <ExportButton bulk disabled={exportAndPurgeDisabled} isDm />
                <PurgeButton disabled={exportAndPurgeDisabled} isDm />
                <PauseButton disabled={pauseCancelDisabled} />
                <Button
                  disabled={searchDisabled}
                  onClick={fetchDmData}
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
            {messages.length === 0 && !!selectedDms.length && searchTouched && (
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

export default DirectMessages;
