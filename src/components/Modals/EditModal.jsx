import React, { useState, useEffect, useRef } from "react";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";
import DiscordButton from "../DiscordComponents/DiscordButton/DiscordButton";
import DiscordTextField from "../DiscordComponents/DiscordTextField/DiscordTextField";
import DiscordSpinner from "../DiscordComponents/DiscordSpinner/DiscordSpinner";
import Box from "@mui/material/Box";
import { editMessage } from "../../discordService";
import DiscordDialog from "../DiscordComponents/DiscordDialog/DiscordDialog";
import DiscordDialogTitle from "../DiscordComponents/DiscordDialog/DiscordDialogTitle";
import DiscordDialogContent from "../DiscordComponents/DiscordDialog/DiscordDialogContent";
import DiscordDialogActions from "../DiscordComponents/DiscordDialog/DiscordDialogActions";
import DiscordPaper from "../DiscordComponents/DiscordPaper/DiscordPaper";
import MessageChip from "../Chips/MessageChip";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { textSecondary } from "../../styleConstants";
import ModalDebugMessage from "./Utility/ModalDebugMessage";
import { toggleDebugPause } from "./Utility/utility";

const EditModal = ({
  userData,
  open,
  handleClose,
  selected,
  rows,
  setOriginalRows,
  originalRows,
}) => {
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
          userData.token,
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
    <DiscordDialog open={open} onClose={() => handleClose(updatedRows)}>
      <DiscordDialogTitle>
        <DiscordTypography variant="h5">Edit Data</DiscordTypography>
        <DiscordTypography variant="caption">
          Proceed with caution, this is permanent!
        </DiscordTypography>
      </DiscordDialogTitle>
      <DiscordDialogContent>
        <DiscordPaper>
          <DiscordTextField
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
              <DiscordSpinner />
              <DiscordTypography sx={{ display: "block" }} variant="caption">
                {editObj.id}
              </DiscordTypography>
            </>
          )}
        </DiscordPaper>
      </DiscordDialogContent>
      <DiscordDialogActions>
        <DiscordButton
          label="Close"
          onClick={() => handleClose(updatedRows)}
          neutral
        />
        <DiscordButton
          disabled={updateText.length === 0 || editing}
          label="Edit"
          onClick={handleEditMessage}
          autoFocus
        />
      </DiscordDialogActions>
    </DiscordDialog>
  );
};
export default EditModal;
