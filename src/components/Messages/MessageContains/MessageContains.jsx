import React, { useRef, useEffect } from "react";
import { IconButton, TextField } from "@mui/material";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMessage,
  setSearchMessageContent,
} from "../../../features/message/messageSlice";

function MessageContains({ disabled }) {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const { searchMessageContent } = useSelector(selectMessage);

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
              onClick={() => dispatch(setSearchMessageContent(null))}
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
        onChange={(e) => dispatch(setSearchMessageContent(e.target.value))}
      />
    </Tooltip>
  );
}

export default MessageContains;
