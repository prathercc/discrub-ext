import React, { useEffect, useContext, useState } from "react";
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
} from "@mui/material";
import { UserContext } from "../../../context/user/UserContext";
import { DmContext } from "../../../context/dm/DmContext";
import { MessageContext } from "../../../context/message/MessageContext";
import DirectMessagesStyles from "./Styles/DirectMessages.styles";
import ExportButton from "../../Export/ExportButton/ExportButton";
import PurgeButton from "../../Purge/PurgeButton";
import AdvancedFiltering from "../AdvancedFiltering/AdvancedFiltering";
import TokenNotFound from "../TokenNotFound/TokenNotFound";
import { sortByProperty } from "../../../utils";

function DirectMessages() {
  const [searchTouched, setSearchTouched] = useState(false);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [showOptionalFilters, setShowOptionalFilters] = useState(false);

  const { state: userState } = useContext(UserContext);

  const classes = DirectMessagesStyles({
    purgeDialogOpen,
    exportDialogOpen,
    showOptionalFilters,
  });

  const { state: dmState, getDms, setDm } = useContext(DmContext);
  const {
    state: messageState,
    resetMessageData,
    getMessageData,
    resetFilters,
    setSearchAfterDate,
    setSearchBeforeDate,
  } = useContext(MessageContext);

  const { selectedDm, dms } = dmState;
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

  const handleChangeDm = async (id) => {
    setDm(id);
    await setSearchBeforeDate(null);
    await setSearchAfterDate(null);
    await resetFilters();
    await resetMessageData();
    setSearchTouched(false);
  };

  useEffect(() => {
    if (token) getDms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <Stack spacing={2} className={classes.boxContainer}>
      {token && dms && (
        <Stack spacing={2}>
          <Paper className={classes.paper}>
            <Stack spacing={2}>
              <Stack>
                <Typography variant="body1">Direct Messages</Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <Autocomplete
                  clearIcon={<ClearIcon />}
                  onChange={(_, val) => handleChangeDm(val)}
                  options={dms
                    .toSorted((a, b) =>
                      sortByProperty(
                        { name: a.name.toLowerCase() },
                        { name: b.name.toLowerCase() },
                        "name"
                      )
                    )
                    .map((directMessage) => {
                      return directMessage.id;
                    })}
                  getOptionLabel={(id) => dms.find((dm) => dm.id === id)?.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="filled"
                      fullWidth
                      size="small"
                      label="DM"
                      className={classes.dmField}
                    />
                  )}
                  value={selectedDm?.id}
                  disabled={messagesLoading || purgeDialogOpen}
                />
              </Stack>

              <span className={classes.purgeHidden}>
                <AdvancedFiltering
                  isDm
                  setShowOptionalFilters={setShowOptionalFilters}
                  showOptionalFilters={showOptionalFilters}
                />
              </span>

              <Stack
                alignItems="center"
                direction="row"
                spacing={1}
                justifyContent="flex-end"
              >
                <span className={purgeDialogOpen && classes.purgeHidden}>
                  <ExportButton
                    bulk
                    dialogOpen={exportDialogOpen}
                    setDialogOpen={setExportDialogOpen}
                    isDm
                  />
                </span>
                <span className={exportDialogOpen && classes.purgeHidden}>
                  <PurgeButton
                    dialogOpen={purgeDialogOpen}
                    setDialogOpen={setPurgeDialogOpen}
                    isDm
                  />
                </span>

                <Button
                  className={classes.purgeHidden}
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

          {token !== undefined &&
            (token === null || !dms || messagesLoading) && (
              <Paper justifyContent="center" className={classes.paper}>
                <Box className={classes.box}>
                  <CircularProgress />
                  <Typography variant="caption">
                    {fetchedMessageLength > 0
                      ? `Fetched ${fetchedMessageLength} Messages`
                      : "Fetching Data"}
                  </Typography>
                </Box>
              </Paper>
            )}
          {token === undefined && <TokenNotFound />}
        </>
      )}
    </Stack>
  );
}

export default DirectMessages;
