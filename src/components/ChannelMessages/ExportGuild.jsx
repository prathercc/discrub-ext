import React, { useState } from "react";
import { Button, Menu, MenuItem, Divider, Tooltip } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ChannelMessagesStyles from "./ChannelMessages.styles";

const ExportGuild = () => {
  const classes = ChannelMessagesStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = !!anchorEl;
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Local options will inlude attachments alongside messages">
        <Button
          variant="contained"
          disableElevation
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
        >
          Export
        </Button>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem dense onClick={handleClose}>
          HTML (Local)
        </MenuItem>
        <MenuItem dense onClick={handleClose}>
          JSON (Local)
        </MenuItem>
        <Divider />
        <MenuItem dense onClick={handleClose}>
          HTML
        </MenuItem>
        <MenuItem dense onClick={handleClose}>
          JSON
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportGuild;
