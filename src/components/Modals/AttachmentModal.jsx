import React, { useState, useContext } from "react";
import ModalDebugMessage from "./Utility/ModalDebugMessage";
import { toggleDebugPause } from "./Utility/utility";
import {
  Typography,
  Button,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Avatar,
  IconButton,
} from "@mui/material";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { MessageContext } from "../../context/message/MessageContext";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModalStyles from "./Modal.styles";

const AttachmentModal = ({ open, handleClose }) => {
  const classes = ModalStyles();

  const {
    state: messageState,
    updateMessage,
    deleteMessage,
  } = useContext(MessageContext);

  const { attachmentMessage } = messageState;

  const [deleting, setDeleting] = useState(false);
  const [debugMessage, setDebugMessage] = useState("");

  /* Delete a message when no content or attachment will exist for it*/
  const handleDeleteAttachment = async (attachment) => {
    let shouldEdit =
      (attachmentMessage.content && attachmentMessage.content.length > 0) ||
      attachmentMessage.attachments.length > 1;
    setDeleting(true);
    if (shouldEdit) {
      const response = await updateMessage({
        ...attachmentMessage,
        attachments: attachmentMessage.attachments.filter(
          (attch) => attch.id !== attachment.id
        ),
      });
      if (response === null) {
        if (attachmentMessage.attachments.length === 0) handleClose();
      } else {
        await toggleDebugPause(
          setDebugMessage,
          "Entire message must be deleted to remove attachment!"
        );
      }
    } else {
      const response = await deleteMessage(attachmentMessage);
      if (response === null) {
        handleClose();
      } else {
        await toggleDebugPause(
          setDebugMessage,
          "You do not have permission to delete this attachment!"
        );
      }
    }
    setDeleting(false);
  };

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h5">Delete Attachments</Typography>
        <Typography variant="caption">
          Proceed with caution, this is permanent!
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Stack className={classes.stackContainer} spacing={1}>
          {attachmentMessage &&
            attachmentMessage.attachments.map((x, i) => {
              return (
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                  className={classes.attachment}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Tooltip arrow title="Open">
                      <Avatar
                        className={classes.avatar}
                        src={x.url}
                        alt={x.filename}
                        onClick={() => window.open(x.url, "_blank")}
                      />
                    </Tooltip>
                    <Typography variant="caption">
                      {x.filename.length > 60
                        ? `${x.filename.slice(0, 50)}...`
                        : x.filename}
                    </Typography>
                  </Stack>
                  <Tooltip arrow title="Delete">
                    <IconButton
                      disabled={deleting}
                      onClick={() => handleDeleteAttachment(x)}
                    >
                      <DeleteForeverIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              );
            })}
        </Stack>
        <ModalDebugMessage debugMessage={debugMessage} />
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}
        >
          {deleting && <CircularProgress />}
          <Button
            disabled={deleting}
            variant="contained"
            onClick={handleClose}
            color="secondary"
          >
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
export default AttachmentModal;
