import React, { useEffect } from "react";
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
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ModalDebugMessage from "../ModalDebugMessage/ModalDebugMessage";
import ChannelMessagesStyles from "../../Messages/ChannelMessages/Styles/ChannelMessages.styles";
import MessageChip from "../MessageChip/MessageChip";
import PrefilterUser from "../../Messages/PrefilterUser/PrefilterUser";
import PauseButton from "../../PauseButton/PauseButton";
import { useDispatch, useSelector } from "react-redux";
import {
  resetMessageData,
  selectMessage,
  setDiscrubCancelled,
  setDiscrubPaused,
} from "../../../features/message/messageSlice";
import {
  resetChannel,
  selectChannel,
  setPreFilterUserId,
} from "../../../features/channel/channelSlice";
import {
  selectDm,
  setPreFilterUserId as setDmPreFilterUserId,
} from "../../../features/dm/dmSlice";
import {
  purge,
  selectPurge,
  setDeleteObj,
  setDeleting,
} from "../../../features/purge/purgeSlice";
import { selectUser } from "../../../features/user/userSlice";

const PurgeModal = ({ dialogOpen, setDialogOpen, isDm = false }) => {
  const dispatch = useDispatch();
  const classes = ChannelMessagesStyles();

  const {
    isLoading: messagesLoading,
    fetchedMessageLength,
    totalSearchMessages,
  } = useSelector(selectMessage);
  const { channels, selectedChannel, preFilterUserId } =
    useSelector(selectChannel);
  const { selectedDm } = useSelector(selectDm);
  const { deleting, deleteObj, debugMessage } = useSelector(selectPurge);
  const { id: userId } = useSelector(selectUser);

  const finishedPurge = !deleting && deleteObj;

  const deleteType = isDm ? "DM" : "Guild";

  useEffect(() => {
    if (dialogOpen) {
      dispatch(setDeleteObj(null));
      dispatch(setDeleting(false));
      if (!isDm) {
        dispatch(setPreFilterUserId(userId));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen]);

  const handleClose = async () => {
    dispatch(setDiscrubCancelled(true));
    setDialogOpen(false);
    dispatch(resetMessageData());
    isDm
      ? dispatch(setDmPreFilterUserId(null))
      : dispatch(setPreFilterUserId(null));
    !isDm && dispatch(resetChannel());
    dispatch(setDiscrubPaused(false));
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
    <Dialog open={dialogOpen}>
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
        <PauseButton disabled={!deleting} />
        {!finishedPurge && (
          <Button
            disabled={dialogBtnDisabled}
            variant="contained"
            onClick={() => dispatch(purge(isDm ? [selectedDm] : channels))}
          >
            Purge
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PurgeModal;
