import { IconButton, Stack, Typography } from "@mui/material";
import Tooltip from "../../../common-components/tooltip/tooltip";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";

type SkipRepliesProps = {
  skipReplies: boolean;
  messagesLoading: boolean;
  setSkipReplies: (val: boolean) => void;
};

function SkipReplies({
  skipReplies,
  messagesLoading,
  setSkipReplies,
}: SkipRepliesProps) {
  return (
    <Stack flexDirection="row" justifyContent="end">
      <Stack
        sx={{
          alignItems: "center",
          backgroundColor: "rgb(32, 34, 37, 0.25)",
          borderRadius: "15px",
          padding: "8px",
        }}
      >
        <Typography variant="body2">Spreadsheet Options</Typography>
        <Tooltip
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
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default SkipReplies;
