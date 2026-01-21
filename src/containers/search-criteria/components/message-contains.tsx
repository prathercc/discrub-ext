import { useState } from "react";
import Tooltip from "../../../common-components/tooltip/tooltip";
import { useMessageSlice } from "../../../features/message/use-message-slice";
import EnhancedAutocomplete from "../../../common-components/enhanced-autocomplete/enhanced-autocomplete.tsx";

type MessageContainsProps = {
  disabled: boolean;
};

function MessageContains({ disabled }: MessageContainsProps) {
  const { state: messageState, setSearchCriteria } = useMessageSlice();
  const searchCriteria = messageState.searchCriteria();
  const { searchMessageContent } = searchCriteria;
  const [inputValue, setInputValue] = useState("");

  const addPendingInput = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !searchMessageContent.includes(trimmed)) {
      setSearchCriteria({
        searchMessageContent: [...searchMessageContent, trimmed],
      });
    }
    setInputValue("");
  };

  return (
    <Tooltip
      title="Message Content"
      description="Messages containing the specified text. You can add multiple search terms."
      placement="left"
    >
      <EnhancedAutocomplete
        disabled={disabled}
        label="Message Content"
        options={[]}
        multiple
        freeSolo
        tags
        value={searchMessageContent}
        inputValue={inputValue}
        onInputChange={(v) => {
          if (typeof v === "string") {
            setInputValue(v);
          }
        }}
        onChange={(v) => {
          if (Array.isArray(v)) {
            setSearchCriteria({ searchMessageContent: v });
            setInputValue("");
          }
        }}
        onBlur={addPendingInput}
      />
    </Tooltip>
  );
}

export default MessageContains;

