import React, { useState, useContext, useRef } from "react";
import {
  Button,
  Menu,
  MenuItem,
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
  CircularProgress,
  Typography,
} from "@mui/material";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ChannelContext } from "../../context/channel/ChannelContext";
import { GuildContext } from "../../context/guild/GuildContext";
import { MessageContext } from "../../context/message/MessageContext";
import ExportUtils from "../Export/ExportUtils";
import ExportMessages from "../Export/ExportMessages";
import { DmContext } from "../../context/dm/DmContext";

const ExportGuild = ({ dialogOpen, setDialogOpen, isDm = false }) => {
  const exportType = isDm ? "DM" : "Guild";
  const {
    state: messageState,
    getMessageData,
    resetMessageData,
  } = useContext(MessageContext);

  const { state: dmState } = useContext(DmContext);
  const {
    state: channelState,
    setSelectedExportChannels,
    setChannel,
    resetChannel,
  } = useContext(ChannelContext);
  const { state: guildState } = useContext(GuildContext);
  const {
    isLoading: messagesLoading,
    fetchedMessageLength,
    messages,
  } = messageState;
  const { channels, selectedExportChannels } = channelState;
  const { selectedDm } = dmState;
  const { selectedGuild } = guildState;
  const [exporting, setExporting] = useState({
    active: false,
    name: null,
  });
  const exportingActiveRef = useRef();
  const contentRef = useRef();
  exportingActiveRef.current = exporting?.active;
  const [generatingHTML, setGeneratingHTML] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    addToZip,
    generateZip,
    resetZip,
    addToFolder,
    createZipFolder,
    generateHTML,
  } = new ExportUtils(
    contentRef,
    setGeneratingHTML,
    `message-data-${messages.length - 1}`
  );
  const open = !!anchorEl;
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedExportChannels([]);
    resetChannel();
    resetMessageData();
    setExporting({ active: false, name: null });
  };

  const handleChannelSelect = (id) => {
    const isSelected = selectedExportChannels.some((cId) => cId === id);
    if (isSelected)
      setSelectedExportChannels([
        ...selectedExportChannels.filter((cId) => cId !== id),
      ]);
    else setSelectedExportChannels([...selectedExportChannels, id]);
  };

  const handleExportSelected = async (format = "json") => {
    handleClose();
    const selectedChannels = isDm
      ? [selectedDm]
      : channels.filter((c) =>
          selectedExportChannels.some((id) => id === c.id)
        );
    let count = 0;
    while (count < selectedChannels.length) {
      const entity = selectedChannels[count];
      setExporting({ active: true, name: entity.name });
      !isDm && (await setChannel(entity.id));
      const { messages } = await getMessageData();
      const attachmentFolderName = `${entity.name}_images`;
      let attachmentFolder = null;
      const updatedMessages = [];
      for (let c1 = 0; c1 < messages.length; c1 += 1) {
        let updatedMessage = { ...messages[c1] };
        for (let c2 = 0; c2 < messages[c1].attachments.length; c2 += 1) {
          try {
            const attachment = messages[c1].attachments[c2];
            const blob = await fetch(attachment.proxy_url).then((r) =>
              r.blob()
            );
            if (blob.size) {
              if (!attachmentFolder)
                attachmentFolder = createZipFolder(attachmentFolderName);
              const cleanFileName = addToFolder(
                attachmentFolder,
                blob,
                attachment.filename
              );
              updatedMessage.attachments[c2] = {
                ...updatedMessage.attachments[c2],
                local_url: `${attachmentFolderName}/${cleanFileName}`,
              };
            }
          } catch (e) {
            console.error(e);
          }
        }
        updatedMessages.push(updatedMessage);
      }

      if (updatedMessages.length > 0) {
        if (format === "json")
          addToZip(
            new Blob([JSON.stringify(updatedMessages)], { type: "text/plain" }),
            entity.name
          );
        else {
          const htmlBlob = await generateHTML();
          addToZip(htmlBlob, entity.name, "html");
        }
      }

      count += 1;
      if (!exportingActiveRef.current) break;
    }
    await generateZip();
    await resetChannel();
    await resetMessageData();
    setExporting({ active: false, name: null });
    resetZip();
  };

  return (
    <>
      <Button
        disabled={
          (isDm ? selectedDm.id === null : selectedGuild.id === null) ||
          messagesLoading ||
          dialogOpen
        }
        onClick={() => setDialogOpen(true)}
        variant="contained"
      >
        Export
      </Button>
      <ExportMessages componentRef={contentRef} exporting={generatingHTML} />
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Export {exportType}</DialogTitle>
        <DialogContent>
          {!exporting.active && !isDm && (
            <>
              <DialogContentText>Select Channel(s) to export</DialogContentText>
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={3}
              >
                <Box
                  sx={{
                    width: 350,
                    height: 200,
                    overflow: "auto",
                  }}
                >
                  <List disablePadding dense>
                    {channels.map((channel) => (
                      <ListItem key={channel.id} value={channel.id} dense>
                        <ListItemButton
                          role={undefined}
                          onClick={() => handleChannelSelect(channel.id)}
                          dense
                        >
                          <ListItemIcon>
                            <Checkbox
                              size="small"
                              edge="start"
                              checked={selectedExportChannels.some(
                                (cId) => cId === channel.id
                              )}
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
                  <Tooltip
                    title={
                      selectedExportChannels.length
                        ? "Deselect All"
                        : "Select All"
                    }
                  >
                    <IconButton
                      onClick={() =>
                        setSelectedExportChannels(
                          selectedExportChannels.length
                            ? []
                            : channels.map((c) => c.id)
                        )
                      }
                      color={
                        selectedExportChannels.length ? "secondary" : "primary"
                      }
                    >
                      {selectedExportChannels.length ? (
                        <DeselectIcon />
                      ) : (
                        <SelectAllIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </>
          )}
          {exporting.active && (
            <Stack
              direction="column"
              justifyContent="center"
              alignItems="center"
              spacing={2}
              sx={{ minWidth: 300 }}
            >
              <Typography>{exporting.name}</Typography>
              <CircularProgress />
              <Typography variant="caption">
                {fetchedMessageLength || "No"} Messages Found
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            onClick={handleDialogClose}
          >
            Cancel
          </Button>
          <Button
            disabled={
              exporting.active || (!isDm && selectedExportChannels.length === 0)
            }
            variant="contained"
            disableElevation
            onClick={handleClick}
            endIcon={<KeyboardArrowDownIcon />}
          >
            Export
          </Button>

          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem dense onClick={() => handleExportSelected("html")}>
              HTML
            </MenuItem>
            <MenuItem dense onClick={handleExportSelected}>
              JSON
            </MenuItem>
          </Menu>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportGuild;
