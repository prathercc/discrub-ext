import { useEffect } from "react";
import ModalDebugMessage from "./modal-debug-message";
import {
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Avatar,
  Box,
  IconButton,
  useTheme,
  LinearProgress,
} from "@mui/material";
import { AppTask } from "../features/app/app-types";
import Attachment from "../classes/attachment";
import { isMessage } from "../app/guards";
import Tooltip from "../common-components/tooltip/tooltip";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { attachmentIsImage } from "../utils";

type AttachmentModalProps = {
  task: AppTask;
  open: boolean;
  handleClose: () => void;
  onDeleteAttachment: (attachment: Attachment) => void;
};

const AttachmentModal = ({
  task,
  open,
  handleClose,
  onDeleteAttachment,
}: AttachmentModalProps) => {
  const theme = useTheme();
  const { entity, active, statusText } = task || {};

  const handleDeleteAttachment = async (attachment: Attachment) => {
    onDeleteAttachment(attachment);
  };

  useEffect(() => {
    if (!entity || (isMessage(entity) && entity.attachments.length === 0)) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  const getAttachment = (attachment: Attachment) => {
    const width = Number(attachment.width);
    const height = Number(attachment.height);
    const maxHeight = 150;
    const maxWidth = 150;
    return (
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          backgroundColor: theme.palette.background.paper,
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <Avatar
            variant="square"
            sx={{
              cursor: "pointer",
              ...(attachmentIsImage(attachment)
                ? {
                    width: width < 100 ? width : 100,
                    height: height < 100 ? height : 100,
                    transition: "all ease-in-out .5s",
                    borderRadius: "5px",
                    boxShadow: "4px 5px 6px 0px rgba(0,0,0,0.75)",
                    "&:hover": {
                      width: width > maxWidth ? maxWidth : width,
                      height: height > maxHeight ? maxHeight : height,
                    },
                  }
                : {}),
            }}
            src={attachment.url}
            alt={attachment.filename}
            onClick={() => window.open(attachment.url, "_blank")}
          />
          <Tooltip title={attachment.filename}>
            <Box sx={{ overflow: "hidden", display: "flex" }}>
              <Typography
                sx={{
                  width: "200px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                variant="caption"
              >
                {attachment.filename}
              </Typography>
            </Box>
          </Tooltip>
        </Stack>
        <Tooltip arrow title="Delete">
          <IconButton
            disabled={active}
            onClick={() => handleDeleteAttachment(attachment)}
          >
            <DeleteForeverIcon color="error" />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  };

  return (
    <Dialog hideBackdrop fullWidth open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h5">Delete Attachments</Typography>
        <Typography variant="caption">
          Proceed with caution, this is permanent!
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ height: "300px", overflow: "hidden !important" }}>
        <Stack
          sx={{ height: "100%", overflow: "auto", padding: "10px" }}
          spacing={1}
        >
          {isMessage(entity) &&
            entity.attachments.map((a) => {
              return getAttachment(a);
            })}
        </Stack>
        <ModalDebugMessage debugMessage={statusText} />
      </DialogContent>
      <DialogActions sx={{ minHeight: "57px" }}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}
        >
          {active && <LinearProgress sx={{ width: "100%", m: 1 }} />}
          <Button
            disabled={active}
            variant="contained"
            onClick={handleClose}
            color="secondary"
          >
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
export default AttachmentModal;
