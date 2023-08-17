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
import { MessageContext } from "../../../context/message/MessageContext";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import ModalDebugMessage from "../ModalDebugMessage/ModalDebugMessage";
import ChannelMessagesStyles from "../../Messages/ChannelMessages/Styles/ChannelMessages.styles";
import MessageChip from "../MessageChip/MessageChip";
import { UserContext } from "../../../context/user/UserContext";
import { DmContext } from "../../../context/dm/DmContext";
import PrefilterUser from "../../Messages/PrefilterUser/PrefilterUser";
import { wait } from "../../../utils";

const PurgeModal = ({ dialogOpen, setDialogOpen, isDm = false }) => {
  const classes = ChannelMessagesStyles();
  const [deleting, setDeleting] = useState(false);
  const [deleteObj, setDeleteObj] = useState(null);
  const [debugMessage, setDebugMessage] = useState("");
  const resetDebugMessage = () => {
    setDebugMessage("");
  };

  const openRef = useRef();
  openRef.current = dialogOpen;

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
    fetchedMessageLength,
    totalSearchMessages,
  } = messageDataState;
  const { channels, selectedChannel, preFilterUserId } = channelState;
  const { selectedDm } = dmState;

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
      setDebugMessage("Searching for messages...");
      await wait(1, resetDebugMessage);
      await resetMessageData();
      isDm ? await setDm(entity.id) : await setChannel(entity.id);
      isDm && (await setDmPreFilterUserId(userState.id));
      await getMessageData();
      let count = 0;
      const selectedMessages = [...messagesRef.current];

      const selectedCount = selectedMessages.length;

      if (selectedCount === 0) {
        setDebugMessage("Still searching...");
        await wait(1, resetDebugMessage);
      }

      while (count < selectedCount && openRef.current) {
        let currentRow = selectedMessages[count];
        setDeleteObj(
          Object.assign(currentRow, {
            _index: count + 1,
            _total: selectedCount,
          })
        );
        const response = await deleteMessage(currentRow);
        if (response === null) {
          count++;
        } else if (response > 0) {
          setDebugMessage(`Pausing for ${response} seconds`);
          await wait(response, resetDebugMessage);
        } else {
          setDebugMessage("You do not have permission to modify this message!");
          await wait(0.5, resetDebugMessage);
          count++;
        }
      }
      if (!openRef.current) break;
    }
    setDeleting(false);
    await resetMessageData();
    !isDm && (await resetChannel());
  };

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
          {!isDm && !finishedPurge && (
            <PrefilterUser isDm={false} purge disabled={messagesLoading} />
          )}
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
              <Typography className={classes.objIdTypography} variant="caption">
                {deleteObj?._index
                  ? `Message ${deleteObj._index} of ${deleteObj._total}`
                  : ""}
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
  );
};

export default PurgeModal;
