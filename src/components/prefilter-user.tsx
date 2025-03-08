import Tooltip from "../common-components/tooltip/tooltip";
import { useDmSlice } from "../features/dm/use-dm-slice";
import { useGuildSlice } from "../features/guild/use-guild-slice";
import EnhancedAutocomplete from "../common-components/enhanced-autocomplete/enhanced-autocomplete.tsx";
import { useMessageSlice } from "../features/message/use-message-slice.ts";
import { useState } from "react";
import Box from "@mui/material/Box";

type PrefilterUserProps = {
  isDm?: boolean;
  disabled?: boolean;
};

function PrefilterUser({ isDm = false, disabled = false }: PrefilterUserProps) {
  const [filterUsers, setFilterUsers] = useState<string[]>([]);

  const { state: messageState, setSearchCriteria } = useMessageSlice();
  const { userIds } = messageState.searchCriteria();

  const { state: dmState } = useDmSlice();
  const dmPreFilterUsers = dmState.preFilterUsers();

  const { state: guildState } = useGuildSlice();
  const preFilterUsers = guildState.preFilterUsers();

  const users = isDm ? dmPreFilterUsers : preFilterUsers;

  return (
    <Tooltip
      title="Messages By"
      description="Search messages by User(s)"
      placement="left"
    >
      <Box>
        <EnhancedAutocomplete
          disabled={disabled}
          label="Users"
          onChange={(value) => {
            if (Array.isArray(value)) {
              setFilterUsers(value);
              setSearchCriteria({ userIds: value });
              // TODO: Perhaps we can perform User lookups here for new entries, add to prefilterUsers if id belongs to a valid User.
            }
          }}
          onInputChange={(value) => {
            if (Array.isArray(value) && !filterUsers.length) {
              setSearchCriteria({ userIds: value });
            }
          }}
          freeSolo
          options={users?.map((user) => user.id)}
          value={userIds}
          multiple
          getOptionLabel={(id) =>
            users.find((user) => user.id === id)?.name || id
          }
        />
      </Box>
    </Tooltip>
  );
}

export default PrefilterUser;
