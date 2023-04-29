import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Tab,
  Stack,
  Typography,
} from "@mui/material";
import RedditIcon from "@mui/icons-material/Reddit";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";

function RedditDialog() {
  const [subredditOpen, setSubredditOpen] = useState(false);
  const handleSubredditClose = () => {
    setSubredditOpen(false);
  };

  return (
    <>
      <Tooltip
        title="Discrub Subreddit"
        description="The official place to find extension support"
      >
        <Tab onClick={() => setSubredditOpen(true)} icon={<RedditIcon />} />
      </Tooltip>
      <Dialog open={subredditOpen} onClose={handleSubredditClose}>
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            spacing={1}
          >
            <RedditIcon />
            <span>Discrub Subreddit</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography variant="body2">
              Opening new tab to external link -{" "}
              <Typography variant="body2" component="span" color="primary">
                <strong>https://www.reddit.com/r/discrub/</strong>
              </Typography>
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            onClick={handleSubredditClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={() =>
              window.open("https://www.reddit.com/r/discrub/", "_blank")
            }
          >
            Continue to Reddit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default RedditDialog;
