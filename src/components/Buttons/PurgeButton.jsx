import React, { useContext, useState, useRef, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { GuildContext } from "../../context/guild/GuildContext";
import { MessageContext } from "../../context/message/MessageContext";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { ChannelContext } from "../../context/channel/ChannelContext";
import ModalDebugMessage from "../Modals/Utility/ModalDebugMessage";
import ChannelMessagesStyles from "../ChannelMessages/ChannelMessages.styles";
import MessageChip from "../Chips/MessageChip";
import { toggleDebugPause } from "../Modals/Utility/utility";
import { UserContext } from "../../context/user/UserContext";
import { DmContext } from "../../context/dm/DmContext";
import PrefilterUser from "../AdvancedFiltering/PrefilterUser";

const PurgeButton = ({ dialogOpen, setDialogOpen, isDm = false }) => {
  const classes = ChannelMessagesStyles();
  const [deleting, setDeleting] = useState(false);
  const [deleteObj, setDeleteObj] = useState(null);
  const [debugMessage, setDebugMessage] = useState("");

  const openRef = useRef();
  openRef.current = dialogOpen;

  const { state: guildState } = useContext(GuildContext);
  const {
    state: channelState,
    setPreFilterUserId,
    setChannel,
    resetChannel,
  } = useContext(ChannelContext);

  const {
    state: dmState,
    setPreFilterUserId: setDmPreFilterUserId,
    setDm,
  } = useContext(DmContext);

  const {
    state: messageDataState,
    deleteMessage,
    resetMessageData,
    getMessageData,
  } = useContext(MessageContext);
  const { state: userState } = useContext(UserContext);

  const {
    messages,
    isLoading: messagesLoading,
    searchBeforeDate,
    searchAfterDate,
    fetchedMessageLength,
    totalSearchMessages,
  } = messageDataState;
  const { selectedGuild } = guildState;
  const { channels, selectedChannel, preFilterUserId } = channelState;
  const { selectedDm, preFilterUserId: dmPreFilterUserId } = dmState;

  const messagesRef = useRef();
  messagesRef.current = messages;

  const messagesLoadingRef = useRef();
  messagesLoadingRef.current = messagesLoading;

  const finishedPurge = !deleting && deleteObj;

  const deleteType = isDm ? "DM" : "Guild";

  useEffect(() => {
    if (dialogOpen) {
      setDeleteObj(null);
      setDeleting(false);
      if (!isDm) {
        setPreFilterUserId(userState.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen]);

  const handleClose = async () => {
    setDialogOpen(false);
    await resetMessageData();
    isDm ? await setDmPreFilterUserId(null) : await setPreFilterUserId(null);
    !isDm && (await resetChannel());
  };

  const handleDeleteMessage = async () => {
    setDeleting(true);
    for (const entity of isDm ? [selectedDm] : channels) {
      setDeleteObj({});
      await toggleDebugPause(
        setDebugMessage,
        `Searching for messages...`,
        1000
      );
      await resetMessageData();
      isDm ? await setDm(entity.id) : await setChannel(entity.id);
      isDm && (await setDmPreFilterUserId(userState.id));
      await getMessageData();
      let count = 0;
      const selectedMessages = [...messagesRef.current];
      if (selectedMessages.length === 0)
        await toggleDebugPause(setDebugMessage, `Still searching...`, 1000);
      while (count < selectedMessages.length && openRef.current) {
        let currentRow = selectedMessages[count];
        setDeleteObj(currentRow);
        const response = await deleteMessage(currentRow);
        if (response === null) {
          count++;
        } else if (response > 0) {
          await toggleDebugPause(
            setDebugMessage,
            `Pausing for ${response} seconds...`,
            response * 1000
          );
        } else {
          await toggleDebugPause(
            setDebugMessage,
            "You do not have permission to modify this message!"
          );
          count++;
        }
      }
      if (!openRef.current) break;
    }
    setDeleting(false);
    await resetMessageData();
    !isDm && (await resetChannel());
  };

  const disabled =
    (selectedGuild.id === null && selectedDm.id === null) ||
    selectedChannel.id !== null ||
    messages.length > 0 ||
    [
      dmPreFilterUserId,
      preFilterUserId,
      searchBeforeDate,
      searchAfterDate,
      dialogOpen,
      messagesLoading,
    ].some((prop) => !!prop);

  const dialogBtnDisabled =
    deleting || deleteObj || (!isDm && !preFilterUserId);

  const dmDialogText =
    "Are you sure you want to purge this DM? All of your messages will be deleted.";

  const guildDialogText =
    "Are you sure you want to purge this Guild? All messages in every Channel will be deleted for yourself or a given User Id.";

  const searchProgressText = (
    <span>
      Found{" "}
      {totalSearchMessages > 0
        ? ((fetchedMessageLength / totalSearchMessages) * 100)
            .toString()
            .split(".")[0]
        : 0}
      % of <strong>{selectedChannel?.name}</strong> messages
    </span>
  );

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => {
          if (selectedGuild.id || selectedDm.id) {
            setDialogOpen(true);
          }
        }}
        variant="contained"
      >
        Purge
      </Button>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>
          {deleting && deleteObj && `Purging ${deleteType}`}
          {finishedPurge && `${deleteType} Purged`}
          {!finishedPurge && !deleting && `Purge ${deleteType}`}
        </DialogTitle>
        <DialogContent>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              {!finishedPurge && (
                <WarningAmberIcon
                  className={classes.purgeWarning}
                  fontSize="large"
                />
              )}
              {finishedPurge && <ThumbUpIcon fontSize="large" />}
              <DialogContentText>
                <Typography variant="body2">
                  {finishedPurge && `${deleteType} was successfully purged!`}
                  {!finishedPurge && (isDm ? dmDialogText : guildDialogText)}
                </Typography>
              </DialogContentText>
            </Stack>
            {!isDm && !finishedPurge && <PrefilterUser isDm={false} purge />}
            {deleting && deleteObj && (
              <>
                {deleteObj.id && (
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={2}
                  >
                    <MessageChip
                      avatar={`https://cdn.discordapp.com/avatars/${deleteObj?.author?.id}/${deleteObj?.author?.avatar}.png`}
                      username={deleteObj?.username}
                      content={deleteObj?.content}
                    />
                    <ArrowRightAltIcon color="secondary" />
                    <DeleteSweepIcon color="error" />
                  </Stack>
                )}

                <ModalDebugMessage
                  debugMessage={
                    messagesLoading ? searchProgressText : debugMessage
                  }
                />

                <Stack justifyContent="center" alignItems="center">
                  <CircularProgress />
                </Stack>
                <Typography
                  className={classes.objIdTypography}
                  variant="caption"
                >
                  {deleteObj?.id}
                </Typography>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" variant="contained" onClick={handleClose}>
            Cancel
          </Button>
          {!finishedPurge && (
            <Button
              disabled={dialogBtnDisabled}
              variant="contained"
              onClick={handleDeleteMessage}
            >
              Purge
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PurgeButton;
