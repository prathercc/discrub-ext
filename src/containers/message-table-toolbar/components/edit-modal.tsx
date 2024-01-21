import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import MessageChip from "../../../components/message-chip";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ModalDebugMessage from "../../../components/modal-debug-message";
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
import PauseButton from "../../../components/pause-button";
import CancelButton from "../../../components/cancel-button";
import { Modify } from "../../../features/app/app-types";
import { isMessage } from "../../../app/guards";
import { getAvatarUrl } from "../../../utils";

type EditModalProps = {
  open: boolean;
  modify: Modify;
  handleEditMessage: (editText: string) => void;
  handleClose: () => void;
};

const EditModal = ({
  modify,
  handleEditMessage,
  handleClose,
  open,
}: EditModalProps) => {
  const { active, entity, statusText } = modify;

  const [updateText, setUpdateText] = useState("");

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
        {active && isMessage(entity) && (
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
                avatarSrc={getAvatarUrl(entity.author)}
                username={entity.author.username}
                content={entity.content}
              />
              <ArrowRightAltIcon />
              <MessageChip
                avatarSrc={getAvatarUrl(entity.author)}
                username={entity.author.username}
                content={updateText}
              />
            </Box>
            <ModalDebugMessage debugMessage={statusText} />
            <Stack justifyContent="center" alignItems="center">
              <CircularProgress />
            </Stack>
            <Typography sx={{ display: "block" }} variant="caption">
              {entity.id}
            </Typography>
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
