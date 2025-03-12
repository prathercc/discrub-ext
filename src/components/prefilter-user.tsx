import Tooltip from "../common-components/tooltip/tooltip";
import { useDmSlice } from "../features/dm/use-dm-slice";
import { useGuildSlice } from "../features/guild/use-guild-slice";
import EnhancedAutocomplete from "../common-components/enhanced-autocomplete/enhanced-autocomplete.tsx";
import { useMessageSlice } from "../features/message/use-message-slice.ts";
import { useState } from "react";
import { useUserSlice } from "../features/user/use-user-slice.ts";
import { filterBoth, getEntityHint } from "../utils.ts";
import { EntityHint } from "../enum/entity-hint.ts";

type PrefilterUserProps = {
  isDm?: boolean;
  disabled?: boolean;
};

function PrefilterUser({ isDm = false, disabled = false }: PrefilterUserProps) {
  const [filterUsers, setFilterUsers] = useState<string[]>([]);

  const { clearUserMapping, createUserMapping } = useUserSlice();

  const { state: messageState, setSearchCriteria } = useMessageSlice();
  const { userIds } = messageState.searchCriteria();

  const { state: dmState } = useDmSlice();
  const dmPreFilterUsers = dmState.preFilterUsers();

  const { state: guildState } = useGuildSlice();
  const preFilterUsers = guildState.preFilterUsers();
  const selectedGuild = guildState.selectedGuild();

  const users = isDm ? dmPreFilterUsers : preFilterUsers;

  const handleSelectAll = () => {
    if (userIds.length !== users.length) {
      setSearchCriteria({ userIds: users.map((u) => u.id) });
    } else {
      setSearchCriteria({ userIds: [] });
      setFilterUsers([]);
    }
  };

  return (
    <Tooltip
      title="Messages By"
      description="Messages belonging to the specified User(s)."
      secondaryDescription={!isDm ? getEntityHint(EntityHint.USER) : undefined}
      placement="left"
    >
      <EnhancedAutocomplete
        disabled={disabled}
        label="Users"
        onChange={(value) => {
          if (Array.isArray(value)) {
            if (selectedGuild) {
              filterBoth(
                value,
                userIds,
                users.map(({ id }) => id),
              ).forEach((id) => createUserMapping(id, selectedGuild.id));
            }

            setFilterUsers(value);
            setSearchCriteria({ userIds: value });
          }
        }}
        onInputChange={(value) => {
          if (Array.isArray(value) && !filterUsers.length) {
            setSearchCriteria({ userIds: value });
          }
        }}
        freeSolo={!isDm}
        options={users?.map((user) => user.id)}
        value={userIds}
        multiple
        getOptionLabel={(id) =>
          users.find((user) => user.id === id)?.name || id
        }
        onSelectAll={handleSelectAll}
        onOptionRemoval={!isDm ? clearUserMapping : undefined}
      />
    </Tooltip>
  );
}

export default PrefilterUser;
