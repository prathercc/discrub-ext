import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Box,
  Skeleton,
} from "@mui/material";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { fetchAnnouncementMarkdown } from "../../../services/github-service.ts";

type AnnouncementDialogProps = {
  open: boolean;
  handleClose: () => void;
};

const AnnouncementDialog = ({ handleClose, open }: AnnouncementDialogProps) => {
  const [markdown, setMarkdown] = useState<string | Maybe>(null);

  useEffect(() => {
    const getMarkdownData = async () => {
      const data = await fetchAnnouncementMarkdown();
      setMarkdown(data);
    };
    if (open) {
      getMarkdownData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <Dialog
      PaperProps={{ sx: { minHeight: "500px" } }}
      hideBackdrop
      fullWidth
      open={open}
    >
      <DialogTitle>
        <Box gap={1} display="flex" flexDirection="row" alignItems="center">
          <AnnouncementIcon />
          <Typography variant="h5">Latest News</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {markdown ? (
          <ReactMarkdown children={markdown} />
        ) : (
          <Skeleton
            animation="wave"
            sx={{ mt: 1, height: "350px" }}
            variant="rounded"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AnnouncementDialog;
