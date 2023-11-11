import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import MessageChip from "../MessageChip/MessageChip";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
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
  TextField,
} from "@mui/material";
import ModalStyles from "../Styles/Modal.styles";
import { useDispatch, useSelector } from "react-redux";
import {
  editMessages,
  selectMessage,
  setDiscrubCancelled,
  setDiscrubPaused,
} from "../../../features/message/messageSlice";
import PauseButton from "../../PauseButton/PauseButton";
import CancelButton from "../../Messages/CancelButton/CancelButton";

const EditModal = ({ open, handleClose }) => {
  const classes = ModalStyles();
  const dispatch = useDispatch();
  const {
    selectedMessages,
    messages,
    modify: modifyState,
  } = useSelector(selectMessage);

  const {
    active: editing,
    message: editObj,
    statusText: debugMessage,
  } = modifyState;

  const [updateText, setUpdateText] = useState("");

  const handleEditMessage = () => {
    const toEdit = messages.filter((m) =>
      selectedMessages.some((smId) => smId === m.id)
    );
    dispatch(editMessages(toEdit, updateText));
  };

  const handleModalClose = () => {
    if (editing) {
      // We are actively editing, we need to send a cancel request
      dispatch(setDiscrubCancelled(true));
    }
    dispatch(setDiscrubPaused(false));
    handleClose();
  };

  useEffect(() => {
    if (open) {
      setUpdateText("");
    }
  }, [open]);

  return (
    <Dialog fullWidth open={open}>
      <DialogTitle>
        <Typography variant="h5">Edit Data</Typography>
        <Typography variant="caption">
          Proceed with caution, this is permanent!
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          variant="filled"
          disabled={editing}
          label="Update Text"
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
        />
        {editing && editObj && (
          <>
            <Box my={1} className={classes.box}>
              <MessageChip
                avatar={`https://cdn.discordapp.com/avatars/${editObj.author.id}/${editObj.author.avatar}.png`}
                username={editObj.username}
                content={editObj.content}
              />
              <ArrowRightAltIcon className={classes.icon} />
              <MessageChip
                avatar={`https://cdn.discordapp.com/avatars/${editObj.author.id}/${editObj.author.avatar}.png`}
                username={editObj.username}
                content={updateText}
              />
            </Box>
            <ModalDebugMessage debugMessage={debugMessage} />
            <Stack justifyContent="center" alignItems="center">
              <CircularProgress />
            </Stack>
            <Typography className={classes.objIdTypography} variant="caption">
              {editObj.id}
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onCancel={handleModalClose} />
        <PauseButton disabled={!editing} />
        <Button
          variant="contained"
          disabled={updateText.length === 0 || editing}
          onClick={handleEditMessage}
          autoFocus
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default EditModal;
