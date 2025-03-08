import { useState } from "react";
import { useMessageSlice } from "../../../features/message/use-message-slice.ts";
import Tooltip from "../../../common-components/tooltip/tooltip.tsx";
import EnhancedAutocomplete from "../../../common-components/enhanced-autocomplete/enhanced-autocomplete.tsx";
import { useChannelSlice } from "../../../features/channel/use-channel-slice.ts";
import {
  filterBoth,
  getEntityHint,
  getSortedChannels,
} from "../../../utils.ts";
import { EntityHint } from "../../../enum/entity-hint.ts";

type SearchChannelsProps = {
  disabled?: boolean;
};

function SearchChannels({ disabled = false }: SearchChannelsProps) {
  const { state: channelState, loadChannel } = useChannelSlice();
  const channels = channelState.channels();
  const sortedChannels = getSortedChannels(channels);

  const [filterChannels, setFilterChannels] = useState<string[]>([]);

  const { state: messageState, setSearchCriteria } = useMessageSlice();
  const { channelIds } = messageState.searchCriteria();

  const handleSelectAll = () => {
    if (channelIds.length !== channels.length) {
      setSearchCriteria({ channelIds: channels.map((c) => c.id) });
    } else {
      setSearchCriteria({ channelIds: [] });
      setFilterChannels([]);
    }
  };

  return (
    <Tooltip
      title="Channels"
      description="Search messages that exist only in the specified channels"
      secondaryDescription={getEntityHint(EntityHint.THREAD)}
      placement="left"
    >
      <EnhancedAutocomplete
        disabled={disabled}
        label="Channels"
        onChange={(value) => {
          if (Array.isArray(value)) {
            filterBoth(
              value,
              channelIds,
              channels.map(({ id }) => id),
            ).forEach((id) => loadChannel(id));

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
        onSelectAll={handleSelectAll}
      />
    </Tooltip>
  );
}

export default SearchChannels;
