import React, { useState, useEffect } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import MessageChip from "../MessageChip/MessageChip";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import Box from "@mui/material/Box";
import ModalDebugMessage from "../ModalDebugMessage/ModalDebugMessage";
import {
  Typography,
  Button,
  Checkbox,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";
import ModalStyles from "../Styles/Modal.styles";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteMessages,
  selectMessage,
} from "../../../features/message/messageSlice";

const DeleteModal = ({ open, handleClose }) => {
  const classes = ModalStyles();
  const dispatch = useDispatch();
  const {
    selectedMessages,
    messages,
    modify: modifyState,
  } = useSelector(selectMessage);

  const {
    active: deleting,
    message: deleteObj,
    statusText: debugMessage,
  } = modifyState;

  const [deleteConfig, setDeleteConfig] = useState({
    attachments: true,
    messages: true,
  });

  useEffect(() => {
    setDeleteConfig({ attachments: true, messages: true });
  }, [open]);

  const handleDeleteMessage = async () => {
    const selectedRows = messages.filter((x) =>
      selectedMessages.includes(x.id)
    );
    dispatch(deleteMessages(selectedRows, deleteConfig));
    handleClose();
  };
  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h5">Delete Data</Typography>
        <Typography variant="caption">
          Proceed with caution, this is permanent!
        </Typography>
      </DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                color="secondary"
                disabled={deleting}
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
              <Checkbox
                color="secondary"
                disabled={deleting}
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
          {deleting && deleteObj && (
            <>
              <Box my={1} className={classes.box}>
                <MessageChip
                  avatar={`https://cdn.discordapp.com/avatars/${deleteObj.author.id}/${deleteObj.author.avatar}.png`}
                  username={deleteObj.username}
                  content={deleteObj.content}
                />
                <ArrowRightAltIcon className={classes.icon} />
                <DeleteSweepIcon className={classes.deleteIcon} />
              </Box>
              <ModalDebugMessage debugMessage={debugMessage} />
              <Stack justifyContent="center" alignItems="center">
                <CircularProgress />
              </Stack>
              <Typography className={classes.objIdTypography} variant="caption">
                {`Message ${deleteObj._index} of ${deleteObj._total}`}
              </Typography>
            </>
          )}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose} color="secondary">
          Close
        </Button>
        <Button
          variant="contained"
          disabled={deleting}
          onClick={handleDeleteMessage}
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DeleteModal;
