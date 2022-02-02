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

const EditModal = ({ userData, open, handleClose, selected, rows }) => {
  const [updateText, setUpdateText] = useState("");
  const [editing, setEditing] = useState(false);
  const [updatedRows, setUpdatedRows] = useState([]);
  const [editObj, setEditObj] = useState(null);
  const openRef = useRef();
  openRef.current = open;

  const handleEditMessage = async () => {
    setEditing(true);
    setUpdatedRows([]);
    let channelId = rows[0]?.channel_id;
    let count = 0;
    while (count < selected.length && openRef.current) { 
      let oldMessages = await rows.filter((x) => x.id === selected[count]);
      if (oldMessages.length > 0)
        setEditObj({
          avatar: oldMessages[0].avatar,
          content: oldMessages[0].content,
          username: oldMessages[0].username,
          id: oldMessages[0].id,
        });
      try {
        const data = await editMessage(
          userData.token,
          selected[count],
          { content: updateText },
          channelId
        );
        if (!data.message) {
          setUpdatedRows((prevState) => [
            ...prevState,
            { ...data, username: data.author.username },
          ]);
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
      setUpdatedRows([]);
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
