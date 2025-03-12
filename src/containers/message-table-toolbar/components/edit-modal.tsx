import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import SouthIcon from "@mui/icons-material/South";
import ModalAlert from "../../../components/modal-alert.tsx";
import {
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  LinearProgress,
  AlertColor,
} from "@mui/material";
import PauseButton from "../../../components/pause-button";
import CancelButton from "../../../components/cancel-button";
import { AppTask } from "../../../features/app/app-types";
import { isMessage } from "../../../app/guards";
import MessageMock from "../../message-mock/message-mock";
import Message from "../../../classes/message";
import { MISSING_PERMISSION_TO_MODIFY } from "../../../features/message/contants.ts";

type EditModalProps = {
  open: boolean;
  task: AppTask;
  handleEditMessage: (editText: string) => void;
  handleClose: () => void;
};

const EditModal = ({
  task,
  handleEditMessage,
  handleClose,
  open,
}: EditModalProps) => {
  const { active, entity, statusText } = task;

  const [updateText, setUpdateText] = useState("");

  useEffect(() => {
    if (open) {
      setUpdateText("");
    }
  }, [open]);

  const alertSeverity: AlertColor =
    statusText &&
    [MISSING_PERMISSION_TO_MODIFY].some((msg) => statusText.includes(msg))
      ? "error"
      : "info";

  return (
    <Dialog hideBackdrop fullWidth open={open}>
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
        {active && isMessage(entity) && (
          <>
            <Stack
              my={1}
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              gap="5px"
            >
              <Box
                sx={{
                  minHeight: "50px",
                  maxHeight: "50px",
                  overflowX: "hidden",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                <MessageMock browserView index={entity.id} message={entity} />
              </Box>
              <LinearProgress sx={{ width: "100%" }} />
              <SouthIcon />
              <Box
                sx={{
                  minHeight: "50px",
                  maxHeight: "50px",
                  overflowX: "hidden",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                <MessageMock
                  browserView
                  index={entity.id}
                  message={new Message({ ...entity, content: updateText })}
                />
              </Box>
            </Stack>
            <ModalAlert severity={alertSeverity} debugMessage={statusText} />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onCancel={handleClose} />
        <PauseButton disabled={!active} />
        <Button
          variant="contained"
          disabled={updateText.length === 0 || active}
          onClick={() => handleEditMessage(updateText)}
          autoFocus
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default EditModal;
