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
          avatar: currentMessage.avatar,
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
        } else {
          await new Promise((resolve) => setTimeout(resolve, data.retry_after));
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
                  avatar={editObj.avatar}
                  username={editObj.username}
                  content={editObj.content}
                />
                <ArrowRightAltIcon sx={{ color: textSecondary }} />
                <MessageChip
                  avatar={editObj.avatar}
                  username={editObj.username}
                  content={updateText}
                />
              </Box>
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
