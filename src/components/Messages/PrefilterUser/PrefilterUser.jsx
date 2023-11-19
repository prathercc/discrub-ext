import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import ClearIcon from "@mui/icons-material/Clear";
import AdvancedFilteringStyles from "../AdvancedFiltering/AdvancedFiltering.styles";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDm,
  setPreFilterUserId as setDmPreFilterUserId,
} from "../../../features/dm/dmSlice";
import {
  selectChannel,
  setPreFilterUserId,
} from "../../../features/channel/channelSlice";

function PrefilterUser({ isDm = false, purge, disabled = false }) {
  const dispatch = useDispatch();
  const {
    preFilterUserId: dmPreFilterUserId,
    preFilterUserIds: dmPreFilterUserIds,
  } = useSelector(selectDm);
  const { preFilterUserId, preFilterUserIds } = useSelector(selectChannel);

  const classes = AdvancedFilteringStyles();

  const users = isDm ? dmPreFilterUserIds : preFilterUserIds;
  const value = isDm ? dmPreFilterUserId : preFilterUserId;

  const handleSetUserId = (id) => {
    dispatch(isDm ? setDmPreFilterUserId(id) : setPreFilterUserId(id));
  };

  const getDisplayValue = () => {
    const foundUser = users.find((user) => user.id === value);
    return foundUser?.name || (isDm || !value ? "" : value);
  };

  const handleChange = (e, newValue, reason) => {
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
        options={users?.map((user) => user.name)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="filled"
            fullWidth
            size="small"
            label={textfieldLabel}
            className={classes.filterByUserName}
          />
        )}
        value={getDisplayValue()}
        disabled={disabled}
      />
    </Tooltip>
  );
}

export default PrefilterUser;
