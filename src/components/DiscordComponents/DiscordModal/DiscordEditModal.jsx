import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DiscordTypography from "../DiscordTypography/DiscordTypography";
import DiscordButton from "../DiscordButton/DiscordButton";
import DiscordTextField from "../DiscordTextField/DiscordTextField";

const DiscordEditModal = ({ open, handleClose }) => {
  const [updateText, setUpdateText] = useState("");
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
        <DiscordTypography variant="h5">Edit Data</DiscordTypography>
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
        <DiscordTextField
          label="Update Text"
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
        />
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: "#2f3136",
        }}
      >
        <DiscordButton label="Close" onClick={handleClose} neutral />
        <DiscordButton label="Edit" onClick={handleClose} autoFocus />
      </DialogActions>
    </Dialog>
  );
};
export default DiscordEditModal;
