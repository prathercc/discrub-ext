import React from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import DiscordTooltip from "../../../components/DiscordComponents/DiscordTooltip/DiscordToolTip";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import TagsStyles from "../Tags.styles";

function SkipReplies({ skipReplies, messagesLoading, setSkipReplies }) {
  const classes = TagsStyles();
  return (
    <Stack flexDirection="row" justifyContent="end">
      <Stack className={classes.skipRepliesParent} alignItems="center">
        <Typography variant="body2">Spreadsheet Options</Typography>
        <DiscordTooltip
          arrow
          placement="left"
          title={`${skipReplies ? "Skipping" : "Including"} Reply Tags`}
          description={`Tags from message replies will ${
            skipReplies ? "not" : ""
          } be included in the generated spreadsheet`}
        >
          <IconButton
            sx={{ maxWidth: "fit-content" }}
            disabled={messagesLoading}
            onClick={() => setSkipReplies(!skipReplies)}
            color={skipReplies ? "secondary" : "primary"}
          >
            {skipReplies ? <PlaylistRemoveIcon /> : <PlaylistAddCheckIcon />}
          </IconButton>
        </DiscordTooltip>
      </Stack>
    </Stack>
  );
}

export default SkipReplies;
