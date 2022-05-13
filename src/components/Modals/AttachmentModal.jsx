import React, { useState, useEffect, useContext } from "react";
import Grid from "@mui/material/Grid";
import { deleteMessage, editMessage } from "../../discordService";
import AttachmentChip from "../Chips/AttachmentChip";
import ModalDebugMessage from "./Utility/ModalDebugMessage";
import { toggleDebugPause } from "./Utility/utility";
import { UserContext } from "../../context/user/UserContext";
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

const AttachmentModal = ({ open, handleClose, row }) => {
  const { state: userState } = useContext(UserContext);
  const { token } = userState;

  const [deleting, setDeleting] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [debugMessage, setDebugMessage] = useState("");

  /* Delete a message when no content or attachment will exist for it*/
  const handleDeleteAttachment = async (attachment) => {
    let messageWillHaveTextOrAttachmentsRemaining =
      (activeRow.content && activeRow.content.length > 0) ||
      activeRow.attachments.length > 1;
    setDeleting(true);
    try {
      if (messageWillHaveTextOrAttachmentsRemaining) {
        const data = await editMessage(
          token,
          activeRow.id,
          {
            attachments: activeRow.attachments.filter(
              (x) => x.id !== attachment.id
            ),
          },
          activeRow.channel_id
        );
        if (!data.message) {
          setActiveRow(data);
          if (data.attachments.length === 0) handleClose(data);
        } else {
          await toggleDebugPause(
            setDebugMessage,
            "Entire message must be removed in order to delete the selected attachment!"
          );
        }
      } else {
        const response = await deleteMessage(
          token,
          activeRow.id,
          activeRow.channel_id
        );
        if (response.status === 204) {
          handleClose(null);
        } else {
          await toggleDebugPause(
            setDebugMessage,
            "You do not have permission to modify this message!"
          );
        }
      }
    } catch (e) {
      console.error("Error deleting attachment");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (open) setActiveRow({ ...row });
  }, [open]);

  return (
    <Dialog fullWidth open={open} onClose={() => handleClose(activeRow)}>
      <DialogTitle>
        <Typography variant="h5">Delete Attachments</Typography>
        <Typography variant="caption">
          Proceed with caution, this is permanent!
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid spacing={2} container>
          {activeRow &&
            activeRow.attachments.map((x, i) => {
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
        <Button
          variant="contained"
          onClick={() => handleClose(activeRow)}
          color="secondary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AttachmentModal;
