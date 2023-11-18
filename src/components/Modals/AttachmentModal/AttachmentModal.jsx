import React, { useEffect } from "react";
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
import { deleteAttachment } from "../../../features/message/messageSlice";
import { selectApp } from "../../../features/app/appSlice";

const AttachmentModal = ({ open, handleClose }) => {
  const classes = ModalStyles();

  const dispatch = useDispatch();

  const { modify } = useSelector(selectApp);
  const { entity, active, statusText } = modify || {};

  const handleDeleteAttachment = async (attachment) => {
    dispatch(deleteAttachment(attachment));
  };

  useEffect(() => {
    if (!entity || entity.attachments.length === 0) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

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
          {entity &&
            entity.attachments.map((a) => {
              return (
                <Attachment
                  attachment={a}
                  handleDeleteAttachment={handleDeleteAttachment}
                  deleting={active}
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
          {active && <CircularProgress />}
          <Button
            disabled={active}
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
