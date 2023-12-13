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
import { selectMessage } from "../../../features/message/messageSlice";
import {
  resetChannel,
  selectChannel,
} from "../../../features/channel/channelSlice";
import {
  selectDm,
  setPreFilterUserId as setDmPreFilterUserId,
} from "../../../features/dm/dmSlice";
import { purge } from "../../../features/purge/purgeSlice";
import { selectUser } from "../../../features/user/userSlice";
import CancelButton from "../../Messages/CancelButton/CancelButton";
import {
  setDiscrubCancelled,
  setDiscrubPaused,
  selectApp,
  setModifyEntity,
  setIsModifying,
} from "../../../features/app/appSlice";
import {
  selectGuild,
  setPreFilterUserId,
} from "../../../features/guild/guildSlice";

const PurgeModal = ({ dialogOpen, setDialogOpen, isDm = false }) => {
  const dispatch = useDispatch();
  const classes = ChannelMessagesStyles();

  const {
    isLoading: messagesLoading,
    fetchProgress,
    totalSearchMessages,
    lookupUserId,
  } = useSelector(selectMessage);
  const { channels, selectedChannel } = useSelector(selectChannel);
  const { preFilterUserId } = useSelector(selectGuild);
  const { selectedDm } = useSelector(selectDm);
  const { id: userId } = useSelector(selectUser);
  const { modify } = useSelector(selectApp);
  const { active, entity, statusText } = modify;
  const { messageCount, threadCount, parsingThreads } = fetchProgress;

  const finishedPurge = !active && entity;

  const deleteType = isDm ? "DM" : "Guild";

  useEffect(() => {
    if (dialogOpen) {
      dispatch(setModifyEntity(null));
      dispatch(setIsModifying(false));
      if (!isDm) {
        dispatch(setPreFilterUserId(userId));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen]);

  const handleClose = async () => {
    if (!!entity || active) {
      // We are actively deleting, we need to send a cancel request
      dispatch(setDiscrubCancelled(true));
    }
    if (isDm) {
      dispatch(setDmPreFilterUserId(null));
    } else {
      dispatch(setPreFilterUserId(null));
      dispatch(resetChannel());
    }
    dispatch(setDiscrubPaused(false));
    setDialogOpen(false);
  };

  const dialogBtnDisabled = active || entity || (!isDm && !preFilterUserId);

  const dmDialogText =
    "Are you sure you want to purge this DM? All of your messages will be deleted.";

  const guildDialogText =
    "Are you sure you want to purge this Guild? All messages in every Channel will be deleted for yourself or a given User Id.";

  const getProgressText = () => {
    return (
      <>
        {parsingThreads && <>Found {threadCount} Threads</>}
        {!parsingThreads && !lookupUserId && (
          <span>
            Found{" "}
            {totalSearchMessages > 0
              ? ((messageCount / totalSearchMessages) * 100)
                  .toString()
                  .split(".")[0]
              : 0}
            % of <strong>{selectedChannel?.name}</strong> messages
          </span>
        )}
        {lookupUserId && `User Lookup: ${lookupUserId}`}
      </>
    );
  };

  return (
    <Dialog open={dialogOpen}>
      <DialogTitle>
        {active && entity && `Purging ${deleteType}`}
        {finishedPurge && `${deleteType} Purged`}
        {!finishedPurge && !active && `Purge ${deleteType}`}
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
          {active && entity && (
            <>
              {entity.id && (
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}
                >
                  <MessageChip
                    avatar={entity.getAvatarUrl()}
                    username={entity.getUserName()}
                    content={entity.content}
                  />
                  <ArrowRightAltIcon color="secondary" />
                  <DeleteSweepIcon color="error" />
                </Stack>
              )}

              <ModalDebugMessage
                debugMessage={messagesLoading ? getProgressText() : statusText}
              />

              <Stack justifyContent="center" alignItems="center">
                <CircularProgress />
              </Stack>
              <Typography className={classes.objIdTypography} variant="caption">
                {entity?._index
                  ? `Message ${entity._index} of ${entity._total}`
                  : ""}
              </Typography>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <CancelButton onCancel={handleClose} />
        <PauseButton disabled={!active} />
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
