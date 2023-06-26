import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ChatIcon from "@mui/icons-material/Chat";
import EmailIcon from "@mui/icons-material/Email";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import MenuBarStyles from "./Styles/MenuBar.styles";
import DonationDialog from "./DonationDialog/DonationDialog";
import RedditDialog from "./RedditDialog/RedditDialog";
import DataObjectIcon from "@mui/icons-material/DataObject";

const MenuBar = ({ menuIndex, setMenuIndex }) => {
  const classes = MenuBarStyles();

  const handleChange = (event, newValue) => {
    const dialogTabs = [3, 4];
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
        <Tooltip arrow title="Change Log">
          <Tab icon={<DataObjectIcon />} />
        </Tooltip>
        <RedditDialog />
        <DonationDialog />
      </Tabs>
    </>
  );
};

export default MenuBar;
