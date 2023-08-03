import React, { useContext, useRef, useEffect } from "react";
import { IconButton, TextField } from "@mui/material";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { MessageContext } from "../../../context/message/MessageContext";
import CloseIcon from "@mui/icons-material/Close";

function MessageContains({ disabled }) {
  const inputRef = useRef(null);

  const { state: messageState, setSearchMessageContent } =
    useContext(MessageContext);

  const { searchMessageContent } = messageState;

  useEffect(() => {
    if (!searchMessageContent) {
      inputRef.current.value = null;
    }
  }, [searchMessageContent]);

  return (
    <Tooltip
      arrow
      title="Message Content"
      description="Search messages by content"
      placement="top"
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
