/*global chrome*/
import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import InfoIcon from "@mui/icons-material/Info";
import ChatIcon from "@mui/icons-material/Chat";
import EmailIcon from "@mui/icons-material/Email";
import Tooltip from "@mui/material/Tooltip";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  tabs: {
    "& .MuiTabs-indicator": {
      backgroundColor: "#5865f2",
    },
    "& .MuiTab-root": {
      color: "#8e9297",
      fontFamily: 'Ginto,"Helvetica Neue",Helvetica,Arial,sans-serif',
    },
    "& .MuiTab-root.Mui-selected": {
      color: "#FFF",
    },
    "& .MuiTabs-flexContainer": {
      backgroundColor: "#2f3136",
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
        <Tooltip title="Identity">
          <Tab icon={<AccountBoxIcon />} />
        </Tooltip>
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
