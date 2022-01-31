import React, { useState, useEffect, useRef } from "react";
import DiscordCheckBox from "../DiscordComponents/DiscordCheckBox/DiscordCheckBox";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import DiscordButton from "../DiscordComponents/DiscordButton/DiscordButton";
import DiscordDialog from "../DiscordComponents/DiscordDialog/DiscordDialog";
import DiscordDialogActions from "../DiscordComponents/DiscordDialog/DiscordDialogActions";
import DiscordDialogContent from "../DiscordComponents/DiscordDialog/DiscordDialogContent";
import DiscordDialogTitle from "../DiscordComponents/DiscordDialog/DiscordDialogTitle";
import DiscordPaper from "../DiscordComponents/DiscordPaper/DiscordPaper";
import { textSecondary } from "../../styleConstants";
import { deleteMessage, editMessage } from "../../discordService";

const DeleteModal = ({ open, handleClose, rows, selected, userData }) => {
  const [deleteConfig, setDeleteConfig] = useState({
    attachments: true,
    messages: true,
  });
  const [deleting, setDeleting] = useState(false);
  const [deletedRows, setDeletedRows] = useState([]);
  const openRef = useRef();
  openRef.current = open;
  const deletedRowsRef = useRef();
  deletedRowsRef.current = deletedRows;

  const handleDeleteMessage = async () => {
    setDeleting(true);
    setDeletedRows([]);
    let channelId = rows[0]?.channel_id;
    let count = 0;
    while (count < selected.length && openRef.current) {
      try {
        if (deleteConfig.attachments && deleteConfig.messages) {
          const response = await deleteMessage(
            userData.token,
            selected[count],
            channelId
          );
          if (response.status === 204) {
            setDeletedRows((prevState) => [...prevState, selected[count]]);
            count++;
          } else {
            await new Promise((resolve) =>
              setTimeout(resolve, response.retry_after)
            );
          }
        } else {
          //Logic to either remove attachments or content
        }
      } catch (e) {
        console.error("Error Deleting Message");
      }
    }
    setDeleting(false);
    handleClose(deletedRowsRef.current);
  };
  return (
    <DiscordDialog open={open} onClose={() => handleClose(deletedRows)}>
      <DiscordDialogTitle>
        <DiscordTypography variant="h5">Delete Data</DiscordTypography>
        <DiscordTypography variant="caption">
          Proceed with caution, this is permanent!
        </DiscordTypography>
      </DiscordDialogTitle>
      <DiscordDialogContent>
        <DiscordPaper>
          <FormGroup>
            <FormControlLabel
              sx={{ color: textSecondary, userSelect: "none" }}
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
              sx={{ color: textSecondary, userSelect: "none" }}
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
        </DiscordPaper>
      </DiscordDialogContent>
      <DiscordDialogActions>
        <DiscordButton
          label="Close"
          onClick={() => handleClose(deletedRows)}
          neutral
        />
        <DiscordButton label="Delete" onClick={handleDeleteMessage} autoFocus />
      </DiscordDialogActions>
    </DiscordDialog>
  );
};
export default DeleteModal;
