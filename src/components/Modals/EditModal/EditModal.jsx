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
} from "../../../features/message/messageSlice";
import PauseButton from "../../PauseButton/PauseButton";
import CancelButton from "../../Messages/CancelButton/CancelButton";
import {
  selectApp,
  setDiscrubCancelled,
  setDiscrubPaused,
} from "../../../features/app/appSlice";

const EditModal = ({ open, handleClose }) => {
  const classes = ModalStyles();
  const dispatch = useDispatch();
  const { modify } = useSelector(selectApp);
  const { selectedMessages, messages } = useSelector(selectMessage);

  const { active, entity, statusText } = modify;

  const [updateText, setUpdateText] = useState("");

  const handleEditMessage = () => {
    const toEdit = messages.filter((m) =>
      selectedMessages.some((smId) => smId === m.id)
    );
    dispatch(editMessages(toEdit, updateText));
  };

  const handleModalClose = () => {
    if (active) {
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
          disabled={active}
          label="Update Text"
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
        />
        {active && entity && (
          <>
            <Box my={1} className={classes.box}>
              <MessageChip
                avatar={entity.getAvatarUrl()}
                username={entity.getUserName()}
                content={entity.content}
              />
              <ArrowRightAltIcon className={classes.icon} />
              <MessageChip
                avatar={entity.getAvatarUrl()}
                username={entity.getUserName()}
                content={updateText}
              />
            </Box>
            <ModalDebugMessage debugMessage={statusText} />
            <Stack justifyContent="center" alignItems="center">
              <CircularProgress />
            </Stack>
            <Typography className={classes.objIdTypography} variant="caption">
              {entity.id}
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onCancel={handleModalClose} />
        <PauseButton disabled={!active} />
        <Button
          variant="contained"
          disabled={updateText.length === 0 || active}
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
