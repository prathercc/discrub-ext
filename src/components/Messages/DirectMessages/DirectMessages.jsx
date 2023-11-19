import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import DiscordTable from "../../DiscordComponents/DiscordTable/DiscordTable";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Typography,
  Paper,
  Stack,
  CircularProgress,
  TextField,
  Button,
  Autocomplete,
  IconButton,
  Collapse,
} from "@mui/material";
import DirectMessagesStyles from "./Styles/DirectMessages.styles";
import ExportButton from "../../Export/ExportButton/ExportButton";
import PurgeButton from "../../Purge/PurgeButton/PurgeButton";
import AdvancedFiltering from "../AdvancedFiltering/AdvancedFiltering";
import TokenNotFound from "../TokenNotFound/TokenNotFound";
import { sortByProperty } from "../../../utils";
import CopyAdornment from "../CopyAdornment/CopyAdornment";
import PauseButton from "../../PauseButton/PauseButton";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../../features/user/userSlice";
import { changeDm, getDms, selectDm } from "../../../features/dm/dmSlice";
import {
  getMessageData,
  selectMessage,
} from "../../../features/message/messageSlice";
import CancelButton from "../CancelButton/CancelButton";
import { selectApp } from "../../../features/app/appSlice";
import DiscordTooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

function DirectMessages() {
  const [searchTouched, setSearchTouched] = useState(false);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showOptionalFilters, setShowOptionalFilters] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const dispatch = useDispatch();
  const { token, isLoading: userLoading } = useSelector(selectUser);
  const { selectedDm, dms, preFilterUserId } = useSelector(selectDm);
  const {
    lookupUserId,
    fetchedMessageLength,
    isLoading: messagesLoading,
    messages,
    searchBeforeDate,
    searchAfterDate,
    searchMessageContent,
    selectedHasTypes,
  } = useSelector(selectMessage);
  const { discrubCancelled } = useSelector(selectApp);

  const classes = DirectMessagesStyles();

  const fetchDmData = async () => {
    dispatch(getMessageData(null, selectedDm.id, preFilterUserId));
    setSearchTouched(true);
    setExpanded(false);
  };

  const handleChangeDm = async (id) => {
    dispatch(changeDm(id));
    setSearchTouched(false);
  };

  const sortedDms = dms.toSorted((a, b) =>
    sortByProperty(
      { name: a.name.toLowerCase() },
      { name: b.name.toLowerCase() },
      "name"
    )
  );

  const advancedFilterActive = [
    preFilterUserId,
    searchBeforeDate,
    searchAfterDate,
    searchMessageContent,
    selectedHasTypes.length,
  ].some((c) => c);

  const dmFieldDisabled = messagesLoading || discrubCancelled;
  const searchDisabled = !selectedDm.id || messagesLoading || discrubCancelled;
  const pauseCancelDisabled = !messagesLoading;
  const exportAndPurgeDisabled =
    !selectedDm.id ||
    messagesLoading ||
    messages.length > 0 ||
    advancedFilterActive ||
    discrubCancelled;

  useEffect(() => {
    if (token) dispatch(getDms());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Stack spacing={2} className={classes.boxContainer}>
      {token && dms && (
        <Stack spacing={2}>
          <Paper className={classes.paper}>
            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1">Direct Messages</Typography>
                <DiscordTooltip title={expanded ? "Collapse" : "Expand"}>
                  <IconButton
                    onClick={(e) => {
                      setExpanded(!expanded);
                    }}
                    color="secondary"
                  >
                    {expanded ? <RemoveIcon /> : <AddIcon />}
                  </IconButton>
                </DiscordTooltip>
              </Stack>

              <Collapse orientation="vertical" in={expanded}>
                <Stack direction="column" gap="5px">
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={1}
                  >
                    <Autocomplete
                      clearIcon={<ClearIcon />}
                      onChange={(_, val) => handleChangeDm(val)}
                      options={sortedDms.map((directMessage) => {
                        return directMessage.id;
                      })}
                      getOptionLabel={(id) =>
                        dms.find((dm) => dm.id === id)?.name
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="filled"
                          fullWidth
                          size="small"
                          label="DM"
                          className={classes.dmField}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <CopyAdornment
                                copyValue={sortedDms
                                  .map((dm) => dm.name)
                                  .join("\r\n")}
                                copyName="DM List"
                                disabled={dmFieldDisabled}
                              />
                            ),
                          }}
                        />
                      )}
                      value={selectedDm?.id}
                      disabled={dmFieldDisabled}
                    />
                  </Stack>

                  <AdvancedFiltering
                    isDm
                    setShowOptionalFilters={setShowOptionalFilters}
                    showOptionalFilters={showOptionalFilters}
                  />
                </Stack>
              </Collapse>
              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                justifyContent="flex-end"
              >
                <ExportButton
                  bulk
                  disabled={exportAndPurgeDisabled}
                  dialogOpen={exportDialogOpen}
                  setDialogOpen={setExportDialogOpen}
                  isDm
                />

                <PurgeButton
                  disabled={exportAndPurgeDisabled}
                  dialogOpen={purgeDialogOpen}
                  setDialogOpen={setPurgeDialogOpen}
                  isDm
                />

                <PauseButton disabled={pauseCancelDisabled} />

                <Button
                  disabled={searchDisabled}
                  onClick={() => selectedDm.id && fetchDmData()}
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

      {!purgeDialogOpen && !exportDialogOpen && (
        <>
          {!messagesLoading && (
            <>
              {messages.length > 0 && (
                <Box className={classes.tableBox}>
                  <DiscordTable />
                </Box>
              )}
              {messages.length === 0 && selectedDm.id && searchTouched && (
                <Paper className={classes.paper}>
                  <Box className={classes.box}>
                    <SentimentDissatisfiedIcon />
                    <Typography>No Messages to Display</Typography>
                  </Box>
                </Paper>
              )}
            </>
          )}

          {(userLoading || messagesLoading) && (
            <Paper justifyContent="center" className={classes.paper}>
              <Box className={classes.box}>
                <CircularProgress />
                <Typography variant="caption">
                  {lookupUserId && `User Lookup: ${lookupUserId}`}
                  {!lookupUserId &&
                    fetchedMessageLength > 0 &&
                    `Fetched ${fetchedMessageLength} Messages`}
                  {!lookupUserId &&
                    fetchedMessageLength <= 0 &&
                    "Fetching Data"}
                </Typography>
              </Box>
            </Paper>
          )}
          {!token && !userLoading && <TokenNotFound />}
        </>
      )}
    </Stack>
  );
}

export default DirectMessages;
