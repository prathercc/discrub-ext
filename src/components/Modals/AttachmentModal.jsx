import React, { useState, useEffect } from "react";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";
import DiscordButton from "../DiscordComponents/DiscordButton/DiscordButton";
import DiscordTextField from "../DiscordComponents/DiscordTextField/DiscordTextField";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { deleteMessage, editMessage } from "../../discordService";
import DiscordSpinner from "../DiscordComponents/DiscordSpinner/DiscordSpinner";
import { textPrimary, textSecondary } from "../../styleConstants";
import DiscordDialog from "../DiscordComponents/DiscordDialog/DiscordDialog";
import DiscordDialogTitle from "../DiscordComponents/DiscordDialog/DiscordDialogTitle";
import DiscordDialogContent from "../DiscordComponents/DiscordDialog/DiscordDialogContent";
import DiscordDialogActions from "../DiscordComponents/DiscordDialog/DiscordDialogActions";
import DiscordPaper from "../DiscordComponents/DiscordPaper/DiscordPaper";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import AttachmentChip from "../Chips/AttachmentChip";

const AttachmentModal = ({ open, handleClose, row, userData }) => {
  const [deleting, setDeleting] = useState(false);
  const [activeRow, setActiveRow] = useState(null);

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
        setActiveRow(data);
        if (data.attachments.length === 0) handleClose(data);
      } else {
        await deleteMessage(userData.token, activeRow.id, activeRow.channel_id);
        handleClose(null);
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
