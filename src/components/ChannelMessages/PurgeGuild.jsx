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
import ChannelMessagesStyles from "./ChannelMessages.styles";
import MessageChip from "../Chips/MessageChip";
import { toggleDebugPause } from "../Modals/Utility/utility";
import { UserContext } from "../../context/user/UserContext";
import { DmContext } from "../../context/dm/DmContext";

const PurgeGuild = ({ dialogOpen, setDialogOpen, isDm = false }) => {
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

  const { messages, isLoading: messagesLoading } = messageDataState;
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
    }
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
      isDm
        ? await setDmPreFilterUserId(userState.id)
        : await setPreFilterUserId(userState.id);
      await getMessageData();
      let count = 0;
      const selectedMessages = [...messagesRef.current];
      if (selectedMessages.length === 0)
        await toggleDebugPause(setDebugMessage, `Still searching..`, 1000);
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

  return (
    <>
      <Button
        disabled={
          (selectedGuild.id === null && selectedDm.id === null) ||
          messagesLoading ||
          selectedChannel.id !== null ||
          messages.length > 0 ||
          !!dmPreFilterUserId ||
          !!preFilterUserId ||
          dialogOpen
        }
        onClick={() =>
          (selectedGuild.id || selectedDm.id) && setDialogOpen(true)
        }
        variant="contained"
      >
        Purge
      </Button>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>
          {deleting && deleteObj ? (
            `Purging ${deleteType}`
          ) : finishedPurge ? (
            `${deleteType} Purged`
          ) : (
            <>
              <span className={classes.purgeWarning}>WARNING - </span>{" "}
              Irreversible Action!
            </>
          )}
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
              {!finishedPurge && <WarningAmberIcon fontSize="large" />}
              {finishedPurge && <ThumbUpIcon fontSize="large" />}
              <DialogContentText>
                {finishedPurge ? (
                  `${deleteType} was successfully purged!`
                ) : (
                  <span>
                    Are you sure you want to purge this {deleteType}? All of{" "}
                    <strong className={classes.purgeWarning}>your</strong>{" "}
                    messages will be deleted
                    {isDm ? "." : " for each Channel."}
                  </span>
                )}
              </DialogContentText>
            </Stack>
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

                <ModalDebugMessage debugMessage={debugMessage} />
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
              disabled={deleting || deleteObj}
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

export default PurgeGuild;
