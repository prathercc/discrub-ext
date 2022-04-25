import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import InfoIcon from "@mui/icons-material/Info";
import ChatIcon from "@mui/icons-material/Chat";
import EmailIcon from "@mui/icons-material/Email";
import Tooltip from "@mui/material/Tooltip";
import { makeStyles } from "@mui/styles";
import {
  discordSecondary,
  textPrimary,
  textSecondary,
  fontFamily,
} from "../../styleConstants";

const useStyles = makeStyles({
  tabs: {
    "& .MuiTabs-indicator": {
      backgroundColor: textPrimary,
    },
    "& .MuiTab-root": {
      color: textSecondary,
      fontFamily: fontFamily,
    },
    "& .MuiTab-root.Mui-selected": {
      color: textSecondary,
    },
    "& .MuiTabs-flexContainer": {
      backgroundColor: discordSecondary,
    },
  },
});

const MenuBar = ({ menuIndex, setMenuIndex }) => {
  const classes = useStyles();
  const handleChange = (event, newValue) => {
    setMenuIndex(newValue);
  };
  return (
    <>
      <Tabs className={classes.tabs} value={menuIndex} onChange={handleChange}>
        <Tooltip title="Channel Messages">
          <Tab icon={<ChatIcon />} />
        </Tooltip>
        <Tooltip title="Direct Messages">
          <Tab icon={<EmailIcon />} />
        </Tooltip>
        <Tooltip title="About">
          <Tab icon={<InfoIcon />} />
        </Tooltip>
      </Tabs>
    </>
  );
};

export default MenuBar;
