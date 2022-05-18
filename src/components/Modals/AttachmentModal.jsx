import React, { useState, useContext } from "react";
import Grid from "@mui/material/Grid";
import AttachmentChip from "../Chips/AttachmentChip";
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
} from "@mui/material";
import { MessageContext } from "../../context/message/MessageContext";

const AttachmentModal = ({ open, handleClose }) => {
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
      <DialogContent>
        <Grid spacing={2} container>
          {attachmentMessage &&
            attachmentMessage.attachments.map((x, i) => {
              return (
                <Grid item>
                  <AttachmentChip
                    filename={x.filename}
                    url={x.url}
                    onDelete={() => handleDeleteAttachment(x)}
                    disabled={deleting}
                  />
                </Grid>
              );
            })}
        </Grid>
        {deleting && (
          <Stack justifyContent="center" alignItems="center">
            <CircularProgress />
          </Stack>
        )}
        <ModalDebugMessage debugMessage={debugMessage} />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AttachmentModal;
