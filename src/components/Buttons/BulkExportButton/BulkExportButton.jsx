import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Button,
  Menu,
  MenuItem,
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
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import { GuildContext } from "../../../context/guild/GuildContext";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportUtils from "../../Export/ExportUtils";
import ExportMessages from "../../Export/ExportMessages/ExportMessages";
import { DmContext } from "../../../context/dm/DmContext";
import ImageToggle from "./ImageToggle";
import BulkExportButtonStyles from "./BulkExportButton.styles";

const BulkExportButton = ({ dialogOpen, setDialogOpen, isDm = false }) => {
  const classes = BulkExportButtonStyles();
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
  const { channels, selectedExportChannels, preFilterUserId, selectedChannel } =
    channelState;
  const { selectedDm, preFilterUserId: dmPreFilterUserId } = dmState;
  const { selectedGuild } = guildState;
  const [exporting, setExporting] = useState({
    active: false,
    name: null,
  });
  const [debugText, setDebugText] = useState(null);
  const exportingActiveRef = useRef();
  const contentRef = useRef();
  exportingActiveRef.current = exporting?.active;
  const [generatingHTML, setGeneratingHTML] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [downloadImages, setDownloadImages] = useState(true);
  useEffect(() => {
    if (dialogOpen) {
      setDownloadImages(true);
    }
  }, [dialogOpen]);
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

  const isExportCancelled = () => !exportingActiveRef.current;

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
        if (downloadImages) {
          for (let c2 = 0; c2 < messages[c1].attachments.length; c2 += 1) {
            try {
              const attachment = messages[c1].attachments[c2];
              setDebugText(
                `Downloading ${attachment.filename.slice(0, 20)}${
                  attachment.filename.length > 20 ? "..." : ""
                }`
              );
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
            } finally {
              if (isExportCancelled()) break;
            }
          }
        }
        if (isExportCancelled()) break;
        updatedMessages.push(updatedMessage);
        setDebugText(null);
      }

      if (updatedMessages.length > 0) {
        if (isExportCancelled()) break;
        setDebugText("Adding data to archive");
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
      if (isExportCancelled()) break;
    }
    if (!isExportCancelled()) {
      setDebugText("Generating archive");
      await generateZip();
      await resetChannel();
      await resetMessageData();
    }
    setExporting({ active: false, name: null });
    resetZip();
    setDebugText(null);
  };

  return (
    <>
      <Button
        disabled={
          (isDm ? selectedDm.id === null : selectedGuild.id === null) ||
          messagesLoading ||
          selectedChannel.id !== null ||
          messages.length > 0 ||
          !!dmPreFilterUserId ||
          !!preFilterUserId ||
          dialogOpen
        }
        onClick={() => setDialogOpen(true)}
        variant="contained"
      >
        Export {exportType}
      </Button>
      <ExportMessages componentRef={contentRef} exporting={generatingHTML} />
      <Dialog
        PaperProps={{ className: classes.dialogPaper }}
        open={dialogOpen}
        onClose={handleDialogClose}
      >
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
                <Box className={classes.dialogChannelsBox}>
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
                  className={classes.dialogBtnStack}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Tooltip
                    arrow
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
                  <ImageToggle
                    downloadImages={downloadImages}
                    setDownloadImages={setDownloadImages}
                    exportingActiveRef={exportingActiveRef}
                  />
                </Stack>
              </Stack>
            </>
          )}
          {isDm && (
            <>
              <DialogContentText>
                Exporting messages from <strong>@{selectedDm?.name}</strong>
              </DialogContentText>
              <Stack
                className={classes.dialogBtnStack}
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
              >
                <ImageToggle
                  downloadImages={downloadImages}
                  setDownloadImages={setDownloadImages}
                  exportingActiveRef={exportingActiveRef}
                />
              </Stack>
            </>
          )}
          {exporting.active && (
            <Stack
              direction="column"
              justifyContent="center"
              alignItems="center"
              spacing={2}
              className={classes.dialogStatusStack}
            >
              <Typography>{exporting.name}</Typography>
              <CircularProgress />
              <Typography variant="caption">
                {debugText || (
                  <>{fetchedMessageLength || "No"} Messages Found</>
                )}
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

export default BulkExportButton;
