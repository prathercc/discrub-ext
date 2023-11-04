import React from "react";
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
import ModalStyles from "../Styles/Modal.styles";
import Attachment from "./Attachment/Attachment";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAttachment,
  selectMessage,
} from "../../../features/message/messageSlice";

const AttachmentModal = ({ open, handleClose }) => {
  const classes = ModalStyles();

  const dispatch = useDispatch();

  const { modify } = useSelector(selectMessage);
  const { message: modifyMessage, active: deleting, statusText } = modify || {};

  const handleDeleteAttachment = async (attachment) => {
    dispatch(deleteAttachment(attachment));
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
          {modifyMessage &&
            modifyMessage.attachments.map((a) => {
              return (
                <Attachment
                  attachment={a}
                  handleDeleteAttachment={handleDeleteAttachment}
                  deleting={deleting}
                />
              );
            })}
        </Stack>
        <ModalDebugMessage debugMessage={statusText} />
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
