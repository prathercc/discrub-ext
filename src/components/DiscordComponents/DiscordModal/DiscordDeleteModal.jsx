import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DiscordCheckBox from "../DiscordCheckBox/DiscordCheckBox";
import DiscordTypography from "../DiscordTypography/DiscordTypography";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import DiscordButton from "../DiscordButton/DiscordButton";

const DiscordDeleteModal = ({ open, handleClose }) => {
  const [deleteConfig, setDeleteConfig] = useState({
    attachments: true,
    messages: true,
  });
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
        <DiscordTypography variant="h5">Delete Data</DiscordTypography>
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
        <FormGroup>
          <FormControlLabel
            control={
              <DiscordCheckBox
                defaultChecked
                onChange={(e) => {
                  setDeleteConfig({
                    ...deleteConfig,
                    attachments: e.target.checked,
                  });
                }}
              />
            }
            label="Attachments"
          />
          <FormControlLabel
            control={
              <DiscordCheckBox
                defaultChecked
                onChange={(e) => {
                  setDeleteConfig({
                    ...deleteConfig,
                    messages: e.target.checked,
                  });
                }}
              />
            }
            label="Messages"
          />
        </FormGroup>
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: "#2f3136",
        }}
      >
        <DiscordButton label="Close" onClick={handleClose} neutral />
        <DiscordButton label="Delete" onClick={handleClose} autoFocus />
      </DialogActions>
    </Dialog>
  );
};
export default DiscordDeleteModal;
