import React, { useState, useContext } from "react";
import ModalDebugMessage from "../ModalDebugMessage/ModalDebugMessage";
import {
  Typography,
  Button,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";
import { MessageContext } from "../../../context/message/MessageContext";
import ModalStyles from "../Styles/Modal.styles";
import { wait } from "../../../utils";
import Attachment from "./Attachment/Attachment";

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
  const resetDebugMessage = () => {
    setDebugMessage("");
  };

  /**
   * Attempt to delete provided attachment or delete a message when no content or attachment will exist following removal of attachment
   * @param {*} attachment Attachment to delete
   */
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
        setDebugMessage("Entire message must be deleted to remove attachment!");
        await wait(0.5, resetDebugMessage);
      }
    } else {
      const response = await deleteMessage(attachmentMessage);
      if (response === null) {
        handleClose();
      } else {
        setDebugMessage(
          "You do not have permission to delete this attachment!"
        );
        await wait(0.5, resetDebugMessage);
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
            attachmentMessage.attachments.map((a) => {
              return (
                <Attachment
                  attachment={a}
                  handleDeleteAttachment={handleDeleteAttachment}
                  deleting={deleting}
                />
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
