import React, { useEffect, useState } from "react";
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
  resetModify,
  selectMessage,
} from "../../../features/message/messageSlice";

const EditModal = ({ open, handleClose }) => {
  const classes = ModalStyles();
  const dispatch = useDispatch();
  const { selectedMessages, modify: modifyState } = useSelector(selectMessage);

  const {
    active: editing,
    message: editObj,
    statusText: debugMessage,
  } = modifyState;

  const [updateText, setUpdateText] = useState("");

  const handleEditMessage = async () => {
    dispatch(editMessages(selectedMessages, updateText));
  };

  useEffect(() => {
    if (open) {
      dispatch(resetModify());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
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
        <Button variant="contained" onClick={handleClose} color="secondary">
          Close
        </Button>
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
