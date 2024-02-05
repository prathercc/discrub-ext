import {
  Autocomplete,
  AutocompleteInputChangeReason,
  TextField,
} from "@mui/material";
import Tooltip from "../common-components/tooltip/tooltip";
import ClearIcon from "@mui/icons-material/Clear";
import { useDmSlice } from "../features/dm/use-dm-slice";
import { useGuildSlice } from "../features/guild/use-guild-slice";

type PrefilterUserProps = {
  isDm?: boolean;
  purge?: boolean;
  disabled?: boolean;
};

function PrefilterUser({
  isDm = false,
  purge = false,
  disabled = false,
}: PrefilterUserProps) {
  const { state: dmState, setPreFilterUserId: setDmPreFilterUserId } =
    useDmSlice();
  const dmPreFilterUserId = dmState.preFilterUserId();
  const dmPreFilterUsers = dmState.preFilterUsers();

  const { state: guildState, setPreFilterUserId } = useGuildSlice();
  const preFilterUserId = guildState.preFilterUserId();
  const preFilterUsers = guildState.preFilterUsers();

  const users = isDm ? dmPreFilterUsers : preFilterUsers;
  const value = isDm ? dmPreFilterUserId : preFilterUserId;

  const handleSetUserId = (id: Snowflake | Maybe) => {
    isDm ? setDmPreFilterUserId(id) : setPreFilterUserId(id);
  };

  const getDisplayValue = (): string => {
    const foundUser = users.find((user) => user.id === value);
    return foundUser?.name || (isDm || !value ? "" : value);
  };

  const handleChange = (
    _: React.SyntheticEvent<Element, Event>,
    newValue: string,
    reason: AutocompleteInputChangeReason
  ) => {
    if (reason === "input") {
      handleSetUserId(newValue);
    } else if (reason === "reset") {
      const foundUser = users.find((user) => user.name === newValue);
      handleSetUserId(foundUser ? foundUser.id : null);
    } else {
      handleSetUserId(null);
    }
  };

  const toolTipTitle = isDm
    ? "Messages By"
    : `${purge ? "Purge" : "Messages"} By`;

  const toolTipDescription = isDm
    ? "Search messages by User"
    : `${purge ? "Purge" : "Search"} messages by User or User Id`;

  const textfieldLabel = isDm
    ? "Messages By"
    : `${purge ? "Purge" : "Messages"} By`;

  return (
    <Tooltip
      arrow
      title={toolTipTitle}
      description={toolTipDescription}
      placement="top"
    >
      <Autocomplete
        clearIcon={<ClearIcon />}
        freeSolo={!isDm}
        onInputChange={handleChange}
        options={users?.map((user) => user.name || user.id)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="filled"
            fullWidth
            size="small"
            label={textfieldLabel}
            sx={{ width: "280px !important" }}
          />
        )}
        value={getDisplayValue()}
        disabled={disabled}
      />
    </Tooltip>
  );
}

export default PrefilterUser;
