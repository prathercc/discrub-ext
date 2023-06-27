import React, { useContext } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { ExportContext } from "../../../../context/export/ExportContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NoAccountsIcon from "@mui/icons-material/NoAccounts";

const ShowAvatarsToggle = () => {
  const { state: exportState, setShowAvatars } = useContext(ExportContext);
  const { showAvatars, isExporting } = exportState;
  return (
    <Tooltip
      arrow
      placement="top"
      title={`${!showAvatars ? "Not " : ""}Displaying Avatars`}
      description="Displaying Avatars on a large number of messages can negatively affect the speed of the export."
    >
      <IconButton
        disabled={isExporting}
        onClick={async () => await setShowAvatars(!showAvatars)}
        color={showAvatars ? "primary" : "secondary"}
      >
        {!showAvatars ? <NoAccountsIcon /> : <AccountCircleIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ShowAvatarsToggle;
