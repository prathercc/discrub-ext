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

  const { state: messageState, setSearchCriteria } = useMessageSlice();
  const searchCriteria = messageState.searchCriteria();
  const { searchMessageContent } = searchCriteria;

  useEffect(() => {
    if (!searchMessageContent && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [searchMessageContent]);

  return (
    <Tooltip
      title="Message Content"
      description="Messages containing the specified text."
      placement="left"
    >
      <TextField
        fullWidth
        inputRef={inputRef}
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={() => setSearchCriteria({ searchMessageContent: null })}
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
        onChange={(e) =>
          setSearchCriteria({ searchMessageContent: e.target.value })
        }
      />
    </Tooltip>
  );
}

export default MessageContains;
