import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import ModalStyles from "../Styles/Modal.styles";
import { useSelector } from "react-redux";
import { selectApp } from "../../../features/app/appSlice";
import WebhookEmbedMock from "../../Export/Mock/WebhookEmbedMock";

const EmbedModal = ({ open, handleClose }) => {
  const classes = ModalStyles();

  const { modify } = useSelector(selectApp);
  const { entity } = modify || {};

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h5">View Embeds</Typography>
        <Typography variant="caption">
          Embeds associated with this message can be viewed here
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Stack className={classes.stackContainer} pr="25px" spacing={2}>
          {entity?.getRichEmbeds().map((embed) => (
            <WebhookEmbedMock alwaysExpanded={false} embed={embed} />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}
        >
          <Button variant="contained" onClick={handleClose} color="secondary">
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
export default EmbedModal;
