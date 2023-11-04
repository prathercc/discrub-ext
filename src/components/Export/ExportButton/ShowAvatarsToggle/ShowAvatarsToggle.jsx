import React from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NoAccountsIcon from "@mui/icons-material/NoAccounts";
import { useDispatch, useSelector } from "react-redux";
import {
  selectExport,
  setShowAvatars,
} from "../../../../features/export/exportSlice";

const ShowAvatarsToggle = () => {
  const dispatch = useDispatch();
  const { showAvatars, isExporting } = useSelector(selectExport);

  return (
    <Tooltip
      arrow
      placement="top"
      title={`${!showAvatars ? "Not " : ""}Displaying Avatars`}
      description="Displaying Avatars on a large number of messages can negatively affect the speed of the export."
    >
      <IconButton
        disabled={isExporting}
        onClick={() => dispatch(setShowAvatars(!showAvatars))}
        color={showAvatars ? "primary" : "secondary"}
      >
        {!showAvatars ? <NoAccountsIcon /> : <AccountCircleIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ShowAvatarsToggle;
