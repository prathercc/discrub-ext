import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DiscordTypography from "../DiscordTypography/DiscordTypography";
import DiscordButton from "../DiscordButton/DiscordButton";
import DiscordTextField from "../DiscordTextField/DiscordTextField";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { deleteMessage, editMessage } from "../../../discordService";

const DiscordAttachmentModal = ({ open, handleClose, row, userData }) => {
  const [deleting, setDeleting] = useState(false);
  const [activeRow, setActiveRow] = useState(null);

  //Cannot have an empty message, if we delete an attachment and no content (message) exists, then we get 400 error.
  const handleDeleteAttachment = async (attachment) => {
    setDeleting(true);
    try {
      const data = await editMessage(
        userData.token,
        row.id,
        {
          attachments: row.attachments.filter((x) => x.id !== attachment.id),
        },
        row.channel_id
      );
      //   data = await deleteMessage(userData.token, row.id, row.channel_id);
      setActiveRow(data);
    } catch (e) {
      console.error("Error deleting attachment");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (open) setActiveRow({ ...row });
    else setActiveRow(null);
  }, [open]);

  return (
    <Dialog
      sx={{
        backgroundColor: "transparent",
      }}
      open={open}
      onClose={handleClose}
      fullWidth={true}
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          backgroundColor: "#2f3136",
        }}
      >
        <DiscordTypography variant="h5">Delete Attachments</DiscordTypography>
        <DiscordTypography variant="caption">
          Proceed with caution, this is permanent!
        </DiscordTypography>
      </DialogTitle>
      <DialogContent
        sx={{
          color: "rgb(210, 213, 247)",
          backgroundColor: "#2f3136",
        }}
      >
        {row &&
          row.attachments.map((x, i) => {
            return (
              <Grid sx={{ marginTop: "5px" }} container>
                <Grid xs={10} item>
                  <DiscordTextField value={x.url} disabled label="URL" />
                </Grid>
                <Grid xs={2} item>
                  <Tooltip title="Delete">
                    <IconButton
                      disabled={deleting}
                      onClick={() => handleDeleteAttachment(x)}
                    >
                      <DeleteIcon sx={{ color: "rgb(210, 213, 247)" }} />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            );
          })}
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: "#2f3136",
        }}
      >
        <DiscordButton
          label="Close"
          onClick={() => handleClose(activeRow)}
          neutral
        />
      </DialogActions>
    </Dialog>
  );
};
export default DiscordAttachmentModal;
