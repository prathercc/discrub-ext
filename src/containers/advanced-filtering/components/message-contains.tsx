import { useRef, useEffect } from "react";
import { IconButton, TextField } from "@mui/material";
import Tooltip from "../../../common-components/tooltip/tooltip";
import CloseIcon from "@mui/icons-material/Close";
import { useMessageSlice } from "../../../features/message/use-message-slice";

type MessageContainsProps = {
  disabled: boolean;
};

function MessageContains({ disabled }: MessageContainsProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | Maybe>(null);

  const { state: messageState, setSearchMessageContent } = useMessageSlice();
  const searchMessageContent = messageState.searchMessageContent();

  useEffect(() => {
    if (!searchMessageContent && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [searchMessageContent]);

  return (
    <Tooltip
      arrow
      title="Message Content"
      description="Search messages by content"
      placement="left"
    >
      <TextField
        fullWidth
        inputRef={inputRef}
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={() => setSearchMessageContent(null)}
              disabled={disabled}
              color="secondary"
            >
              <CloseIcon />
            </IconButton>
          ),
        }}
        disabled={disabled}
        size="small"
        label="Message Content"
        variant="filled"
        value={searchMessageContent}
        onChange={(e) => setSearchMessageContent(e.target.value)}
      />
    </Tooltip>
  );
}

export default MessageContains;
