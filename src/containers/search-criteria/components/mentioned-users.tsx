import { useState } from "react";
import { useMessageSlice } from "../../../features/message/use-message-slice.ts";
import { useDmSlice } from "../../../features/dm/use-dm-slice.ts";
import { useGuildSlice } from "../../../features/guild/use-guild-slice.ts";
import Tooltip from "../../../common-components/tooltip/tooltip.tsx";
import EnhancedAutocomplete from "../../../common-components/enhanced-autocomplete/enhanced-autocomplete.tsx";
import Box from "@mui/material/Box";

type MentionedUsersProps = {
  isDm?: boolean;
  disabled?: boolean;
};

function MentionedUsers({
  isDm = false,
  disabled = false,
}: MentionedUsersProps) {
  const [filterUsers, setFilterUsers] = useState<string[]>([]);

  const { state: messageState, setSearchCriteria } = useMessageSlice();
  const { mentionIds } = messageState.searchCriteria();

  const { state: dmState } = useDmSlice();
  const dmPreFilterUsers = dmState.preFilterUsers();

  const { state: guildState } = useGuildSlice();
  const preFilterUsers = guildState.preFilterUsers();

  const users = isDm ? dmPreFilterUsers : preFilterUsers;

  return (
    <Tooltip
      title="Mentions By"
      description="Search messages that mention the specified User(s)"
      placement="left"
    >
      <Box>
        <EnhancedAutocomplete
          disabled={disabled}
          label="Mentions By"
          onChange={(value) => {
            if (Array.isArray(value)) {
              setFilterUsers(value);
              setSearchCriteria({ mentionIds: value });
            }
          }}
          onInputChange={(value) => {
            if (Array.isArray(value) && !filterUsers.length) {
              setSearchCriteria({ mentionIds: value });
            }
          }}
          freeSolo
          options={users?.map((user) => user.id)}
          value={mentionIds}
          multiple
          getOptionLabel={(id) =>
            users.find((user) => user.id === id)?.name || id
          }
        />
      </Box>
    </Tooltip>
  );
}

export default MentionedUsers;
