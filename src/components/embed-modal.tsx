import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import WebhookEmbedMock from "./webhook-embed-mock";
import { AppTask } from "../features/app/app-types";
import { getRichEmbeds } from "../utils";
import { isMessage } from "../app/guards";

type EmbedModalProps = {
  task: AppTask;
  open: boolean;
  handleClose: () => void;
};

const EmbedModal = ({ task, open, handleClose }: EmbedModalProps) => {
  const { entity } = task || {};

  return (
    <Dialog hideBackdrop fullWidth open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h5">View Embeds</Typography>
        <Typography variant="caption">
          Embeds associated with this message can be viewed here
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ height: "300px", overflow: "hidden !important" }}>
        <Stack
          sx={{ height: "100%", overflow: "auto", padding: "10px" }}
          pr="25px"
          spacing={2}
        >
          {isMessage(entity) &&
            getRichEmbeds(entity).map((embed) => (
              <WebhookEmbedMock
                alwaysExpanded={false}
                embed={embed}
                message={entity}
              />
            ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ minHeight: "57px" }}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}
        >
          <Button variant="contained" onClick={handleClose} color="secondary">
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
export default EmbedModal;
