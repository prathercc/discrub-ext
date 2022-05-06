import React, { useState, useEffect, useRef, useContext } from "react";
import Box from "@mui/material/Box";
import { editMessage } from "../../discordService";
import MessageChip from "../Chips/MessageChip";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { textSecondary } from "../../styleConstants";
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
  TextField,
} from "@mui/material";

const EditModal = ({
  open,
  handleClose,
  selected,
  rows,
  setOriginalRows,
  originalRows,
}) => {
  const { state: userState } = useContext(UserContext);
  const { token } = userState;

  const [updateText, setUpdateText] = useState("");
  const [editing, setEditing] = useState(false);
  const [updatedRows, setUpdatedRows] = useState(rows);
  const [editObj, setEditObj] = useState(null);
  const [debugMessage, setDebugMessage] = useState("");
  const openRef = useRef();
  openRef.current = open;
  const updatedRowsRef = useRef();
  updatedRowsRef.current = updatedRows;
  const originalRowsRef = useRef();
  originalRowsRef.current = originalRows;

  const handleEditMessage = async () => {
    setEditing(true);
    setUpdatedRows(rows);
    let channelId = rows[0]?.channel_id;
    let count = 0;
    let selectedRows = await rows.filter((x) => selected.includes(x.id));
    while (count < selected.length && openRef.current) {
      let currentMessage = await selectedRows.filter(
        (x) => x.id === selected[count]
      )[0];
      if (currentMessage)
        setEditObj({
          author: currentMessage.author,
          content: currentMessage.content,
          username: currentMessage.username,
          id: currentMessage.id,
        });
      try {
        const data = await editMessage(
          token,
          selected[count],
          { content: updateText },
          channelId
        );
        if (!data.message) {
          let editRows = [];
          let updatedOriginalRows = [];
          await updatedRowsRef.current.forEach((updateRow) => {
            if (updateRow.id === data.id)
              editRows.push({ ...data, username: data.author.username });
            else
              editRows.push({
                ...updateRow,
                username: updateRow.author.username,
              });
          });
          await originalRowsRef.current.forEach((originalRow) => {
            if (originalRow.id === data.id)
              updatedOriginalRows.push({
                ...data,
                username: data.author.username,
              });
            else
              updatedOriginalRows.push({
                ...originalRow,
                username: originalRow.author.username,
              });
          });
          setOriginalRows(updatedOriginalRows);
          setUpdatedRows(editRows);
          count++;
        } else if (data.retry_after) {
          await toggleDebugPause(
            setDebugMessage,
            `Pausing for ${((data.retry_after % 60000) / 1000).toFixed(
              0
            )} seconds...`,
            data.retry_after
          );
        } else {
          await toggleDebugPause(
            setDebugMessage,
            "You do not have permission to modify this message!"
          );
          count++;
        }
      } catch (e) {
        console.error("Error Editing Message");
      }
    }
    setEditing(false);
  };

  useEffect(() => {
    if (open) {
      setUpdateText("");
      setEditing(false);
      setUpdatedRows(rows);
    }
  }, [open]);

  return (
    <Dialog fullWidth open={open} onClose={() => handleClose(updatedRows)}>
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
            <Box
              my={1}
              sx={{
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              <MessageChip
                avatar={`https://cdn.discordapp.com/avatars/${editObj.author.id}/${editObj.author.avatar}.png`}
                username={editObj.username}
                content={editObj.content}
              />
              <ArrowRightAltIcon sx={{ color: textSecondary }} />
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
            <Typography sx={{ display: "block" }} variant="caption">
              {editObj.id}
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => handleClose(updatedRows)}
          color="secondary"
        >
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
