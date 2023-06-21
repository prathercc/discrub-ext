import React, { useState, useEffect, useRef, useContext } from "react";
import Box from "@mui/material/Box";
import MessageChip from "../Chips/MessageChip";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ModalDebugMessage from "./Utility/ModalDebugMessage";
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
import { MessageContext } from "../../context/message/MessageContext";
import ModalStyles from "./Modal.styles";
import { wait } from "../../utils";

const EditModal = ({ open, handleClose }) => {
  const classes = ModalStyles();

  const { state: messageState, updateMessage } = useContext(MessageContext);
  const { selectedMessages, messages } = messageState;

  const [updateText, setUpdateText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editObj, setEditObj] = useState(null);
  const [debugMessage, setDebugMessage] = useState("");
  const resetDebugMessage = () => {
    setDebugMessage("");
  };
  const openRef = useRef();
  openRef.current = open;

  /**
   * Attempt to edit the selected message
   */
  const handleEditMessage = async () => {
    setEditing(true);
    let count = 0;
    while (count < selectedMessages.length && openRef.current) {
      let currentMessage = await messages.filter(
        // eslint-disable-next-line no-loop-func
        (x) => x.id === selectedMessages[count]
      )[0];
      if (currentMessage)
        setEditObj({
          author: currentMessage.author,
          content: currentMessage.content,
          username: currentMessage.username,
          id: currentMessage.id,
        });

      const response = await updateMessage({
        ...currentMessage,
        content: updateText,
      });
      if (response === null) {
        count++;
      } else if (response > 0) {
        setDebugMessage(`Pausing for ${response} seconds...`);
        await wait(response, resetDebugMessage);
      } else {
        setDebugMessage("You do not have permission to modify this message!");
        await wait(0.5, resetDebugMessage);
        count++;
      }
    }
    setEditing(false);
  };

  useEffect(() => {
    if (open) {
      setUpdateText("");
      setEditing(false);
    }
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
