import { useState, useEffect } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import MessageChip from "../../../components/message-chip";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import Box from "@mui/material/Box";
import ModalDebugMessage from "../../../components/modal-debug-message";
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
import PauseButton from "../../../components/pause-button";
import CancelButton from "../../../components/cancel-button";
import { isMessage } from "../../../app/guards";
import { DeleteConfiguration } from "../../../features/message/message-types";
import { Modify } from "../../../features/app/app-types";
import { getAvatarUrl } from "../../../utils";

type DeleteModalProps = {
  open: boolean;
  handleClose: () => void;
  handleDeleteMessage: (deleteConfig: DeleteConfiguration) => void;
  selectedRows: string[];
  modify: Modify;
};

const DeleteModal = ({
  open,
  handleClose,
  selectedRows,
  modify,
  handleDeleteMessage,
}: DeleteModalProps) => {
  const { active, entity, statusText } = modify;

  const [deleteConfig, setDeleteConfig] = useState<DeleteConfiguration>({
    attachments: true,
    messages: true,
  });

  useEffect(() => {
    setDeleteConfig({ attachments: true, messages: true });
  }, [open]);

  useEffect(() => {
    if (selectedRows.length === 0) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRows]);

  return (
    <Dialog fullWidth open={open}>
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
                disabled={active}
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
                disabled={active}
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
                <DeleteSweepIcon sx={{ color: "red" }} />
              </Box>
              <ModalDebugMessage debugMessage={statusText} />
              <Stack justifyContent="center" alignItems="center">
                <CircularProgress />
              </Stack>
              <Typography sx={{ display: "block" }} variant="caption">
                {`Message ${entity._index} of ${entity._total}`}
              </Typography>
            </>
          )}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <CancelButton onCancel={handleClose} />
        <PauseButton disabled={!active} />
        <Button
          variant="contained"
          disabled={active}
          onClick={() => handleDeleteMessage(deleteConfig)}
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DeleteModal;
