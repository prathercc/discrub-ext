import { useState } from "react";
import { useMessageSlice } from "../../../features/message/use-message-slice.ts";
import Tooltip from "../../../common-components/tooltip/tooltip.tsx";
import EnhancedAutocomplete from "../../../common-components/enhanced-autocomplete/enhanced-autocomplete.tsx";
import Box from "@mui/material/Box";
import { useChannelSlice } from "../../../features/channel/use-channel-slice.ts";
import { getSortedChannels } from "../../../utils.ts";

type SearchChannelsProps = {
  disabled?: boolean;
};

function SearchChannels({ disabled = false }: SearchChannelsProps) {
  const { state: channelState } = useChannelSlice();
  const channels = channelState.channels();
  const sortedChannels = getSortedChannels(channels);

  const [filterChannels, setFilterChannels] = useState<string[]>([]);

  const { state: messageState, setSearchCriteria } = useMessageSlice();
  const { channelIds } = messageState.searchCriteria();

  return (
    <Tooltip
      title="Channels"
      description="Search messages that exist only in the specified channels"
      placement="left"
    >
      <Box>
        <EnhancedAutocomplete
          disabled={disabled}
          label="Channels"
          onChange={(value) => {
            if (Array.isArray(value)) {
              setFilterChannels(value);
              setSearchCriteria({ channelIds: value });
            }
          }}
          onInputChange={(value) => {
            if (Array.isArray(value) && !filterChannels.length) {
              setSearchCriteria({ channelIds: value });
            }
          }}
          freeSolo
          options={sortedChannels?.map((c) => c.id)}
          value={channelIds}
          multiple
          getOptionLabel={(id) => channels.find((c) => c.id === id)?.name || id}
        />
      </Box>
    </Tooltip>
  );
}

export default SearchChannels;
