import React, { useState, useContext } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  Box,
} from "@mui/material";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ChannelMessagesStyles from "./ChannelMessages.styles";
import { ChannelContext } from "../../context/channel/ChannelContext";
import { GuildContext } from "../../context/guild/GuildContext";
import { MessageContext } from "../../context/message/MessageContext";

const ExportGuild = () => {
  const classes = ChannelMessagesStyles();
  const { state: messageState } = useContext(MessageContext);
  const { state: channelState, setSelectedExportChannels } =
    useContext(ChannelContext);
  const { state: guildState } = useContext(GuildContext);
  const { isLoading: messagesLoading } = messageState;
  const { channels, selectedExportChannels } = channelState;
  const { selectedGuild } = guildState;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = !!anchorEl;
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleChannelSelect = (id) => {
    // TODO: Implement
  };

  return (
    <>
      <Button
        disabled={selectedGuild.id === null || messagesLoading || dialogOpen}
        onClick={() => setDialogOpen(true)}
        variant="contained"
      >
        Export
      </Button>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Export Guild</DialogTitle>
        <DialogContent>
          <DialogContentText>Select Channel(s) to export</DialogContentText>
          <Stack direction="column" justifyContent="center" alignItems="center">
            <Box
              sx={{
                width: 350,
                height: 200,
                overflow: "auto",
              }}
            >
              <List>
                {channels.map((channel) => (
                  <ListItem key={channel.id} value={channel.id}>
                    <ListItemButton
                      role={undefined}
                      onClick={() => handleChannelSelect(channel.id)}
                      dense
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={
                            selectedExportChannels.indexOf(channel.id) !== -1
                          }
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText primary={channel.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Stack
              sx={{ width: "100%" }}
              direction="row"
              justifyContent="flex-start"
              alignItems="flex-start"
            >
              <Tooltip title="Select All">
                <IconButton color="primary">
                  <SelectAllIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            onClick={handleDialogClose}
          >
            Cancel
          </Button>
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
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportGuild;
