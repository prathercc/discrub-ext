import React, { useState, useEffect } from "react";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";
import DiscordButton from "../DiscordComponents/DiscordButton/DiscordButton";
import Grid from "@mui/material/Grid";
import { deleteMessage, editMessage } from "../../discordService";
import DiscordSpinner from "../DiscordComponents/DiscordSpinner/DiscordSpinner";
import DiscordDialog from "../DiscordComponents/DiscordDialog/DiscordDialog";
import DiscordDialogTitle from "../DiscordComponents/DiscordDialog/DiscordDialogTitle";
import DiscordDialogContent from "../DiscordComponents/DiscordDialog/DiscordDialogContent";
import DiscordDialogActions from "../DiscordComponents/DiscordDialog/DiscordDialogActions";
import DiscordPaper from "../DiscordComponents/DiscordPaper/DiscordPaper";
import AttachmentChip from "../Chips/AttachmentChip";
import ModalDebugMessage from "./Utility/ModalDebugMessage";
import { toggleDebugPause } from "./Utility/utility";

const AttachmentModal = ({ open, handleClose, row, userData }) => {
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
          userData.token,
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
          userData.token,
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
    <DiscordDialog open={open} onClose={() => handleClose(activeRow)}>
      <DiscordDialogTitle>
        <DiscordTypography variant="h5">Delete Attachments</DiscordTypography>
        <DiscordTypography variant="caption">
          Proceed with caution, this is permanent!
        </DiscordTypography>
      </DiscordDialogTitle>
      <DiscordDialogContent>
        <DiscordPaper>
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
          {deleting && <DiscordSpinner />}
          <ModalDebugMessage debugMessage={debugMessage} />
        </DiscordPaper>
      </DiscordDialogContent>
      <DiscordDialogActions>
        <DiscordButton
          label="Close"
          onClick={() => handleClose(activeRow)}
          neutral
        />
      </DiscordDialogActions>
    </DiscordDialog>
  );
};
export default AttachmentModal;
