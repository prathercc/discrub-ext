import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ChatIcon from "@mui/icons-material/Chat";
import EmailIcon from "@mui/icons-material/Email";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";
import MenuBarStyles from "./MenuBar.styles";
import DonationDialog from "./DonationDialog";
import RedditDialog from "./RedditDialog";
import DataObjectIcon from "@mui/icons-material/DataObject";

const MenuBar = ({ menuIndex, setMenuIndex }) => {
  const classes = MenuBarStyles();

  const handleChange = (event, newValue) => {
    const dialogTabs = [2, 3];
    if (!dialogTabs.some((dt) => dt === newValue)) setMenuIndex(newValue);
  };

  return (
    <>
      <Tabs className={classes.tabs} value={menuIndex} onChange={handleChange}>
        <Tooltip arrow title="Channel Messages">
          <Tab icon={<ChatIcon />} />
        </Tooltip>
        <Tooltip arrow title="Direct Messages">
          <Tab icon={<EmailIcon />} />
        </Tooltip>
        <DonationDialog />
        <RedditDialog />
        <Tooltip arrow title="Development Info">
          <Tab icon={<DataObjectIcon />} />
        </Tooltip>
      </Tabs>
    </>
  );
};

export default MenuBar;
