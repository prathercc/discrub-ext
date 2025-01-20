import { useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Stack,
  Typography,
  Box,
  LinearProgress,
  useTheme,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SouthIcon from "@mui/icons-material/South";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import ModalDebugMessage from "../../../components/modal-debug-message";
import PrefilterUser from "../../../components/prefilter-user";
import PauseButton from "../../../components/pause-button";
import CancelButton from "../../../components/cancel-button";
import { useMessageSlice } from "../../../features/message/use-message-slice";
import { useChannelSlice } from "../../../features/channel/use-channel-slice";
import { useDmSlice } from "../../../features/dm/use-dm-slice";
import { useAppSlice } from "../../../features/app/use-app-slice";
import { isMessage } from "../../../app/guards";
import { usePurgeSlice } from "../../../features/purge/use-purge-slice";
import MessageMock from "../../message-mock/message-mock";

type PurgeModalProps = {
  dialogOpen: boolean;
  setDialogOpen: (val: boolean) => void;
  isDm?: boolean;
};

const PurgeModal = ({
  dialogOpen,
  setDialogOpen,
  isDm = false,
}: PurgeModalProps) => {
  const theme = useTheme();

  const { state: messageState } = useMessageSlice();
  const messagesLoading = messageState.isLoading();

  const { state: channelState, resetChannel } = useChannelSlice();
  const channels = channelState.channels();

  const { state: dmState } = useDmSlice();
  const selectedDms = dmState.selectedDms();

  const {
    state: appState,
    setDiscrubCancelled,
    setDiscrubPaused,
    resetModify,
    setIsModifying,
  } = useAppSlice();
  const task = appState.task();

  const { purge } = usePurgeSlice();

  const { active, entity, statusText } = task;

  const finishedPurge = !active && entity;

  const deleteType = isDm
    ? `DM${selectedDms.length > 1 ? "'s" : ""}`
    : "Server";

  useEffect(() => {
    if (dialogOpen) {
      resetModify();
      setIsModifying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen]);

  const handleClose = async () => {
    if (!!entity || active) {
      // We are actively deleting, we need to send a cancel request
      setDiscrubCancelled(true);
    }
    if (!isDm) {
      resetChannel();
    }
    setDiscrubPaused(false);
    setDialogOpen(false);
  };

  const dialogBtnDisabled = Boolean(active || entity);

  const dmDialogText = `Are you sure you want to purge ${
    selectedDms.length > 1 ? "these DM's" : "this DM"
  }? All of your messages will be deleted.`;

  const guildDialogText =
    "Are you sure you want to purge this Server? All messages in every Channel will be deleted for yourself or a given User Id.";

  const handlePurge = () => {
    if (isDm && !!selectedDms.length) {
      purge([...selectedDms]);
    } else if (!isDm && channels.length) {
      purge([...channels]);
    }
  };

  return (
    <Dialog hideBackdrop open={dialogOpen}>
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
                sx={{ color: theme.palette.warning.main }}
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
            <PrefilterUser isDm={false} disabled={Boolean(messagesLoading)} />
          )}
          {active && isMessage(entity) && (
            <>
              <Box
                my={1}
                sx={{
                  minHeight: "50px",
                  maxHeight: "50px",
                  overflowX: "hidden",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                <MessageMock browserView index={entity.id} message={entity} />
              </Box>

              <Stack
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                gap="5px"
                width="100%"
              >
                <LinearProgress sx={{ width: "100%" }} />
                <SouthIcon />
                <DeleteSweepIcon sx={{ color: theme.palette.error.main }} />
              </Stack>
              <Typography sx={{ display: "block" }} variant="caption">
                {entity?._index
                  ? `Message ${entity._index} of ${entity._total}`
                  : ""}
              </Typography>
            </>
          )}
          <ModalDebugMessage debugMessage={statusText} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <CancelButton onCancel={handleClose} />
        <PauseButton disabled={!active} />
        {!finishedPurge && (
          <Button
            disabled={dialogBtnDisabled}
            variant="contained"
            onClick={handlePurge}
          >
            Purge
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PurgeModal;
