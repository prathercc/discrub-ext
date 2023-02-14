import React, { useState, useContext, useRef } from "react";
import { Button, Menu, MenuItem, DialogActions } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportUtils from "../../Export/ExportUtils";
import { DmContext } from "../../../context/dm/DmContext";
import { ExportContext } from "../../../context/export/ExportContext";

const Actions = ({ setDialogOpen, isDm = false }) => {
  const {
    state: exportState,
    setName,
    setIsExporting,
    setStatusText,
  } = useContext(ExportContext);
  const { downloadImages, isExporting } = exportState;

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
  const { messages } = messageState;
  const { channels, selectedExportChannels } = channelState;
  const { selectedDm } = dmState;
  const exportingActiveRef = useRef();
  const contentRef = useRef();
  exportingActiveRef.current = isExporting;
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
    setIsExporting,
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
    setName("");
    setIsExporting(false);
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
      await setIsExporting(true);
      await setName(entity.name);
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
              setStatusText(
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
        setStatusText(null);
      }

      if (updatedMessages.length > 0) {
        if (isExportCancelled()) break;
        setStatusText("Adding data to archive");
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
      setStatusText("Generating archive");
      await generateZip();
      await resetChannel();
      await resetMessageData();
    }
    await setIsExporting(false);
    await setName("");
    resetZip();
    setStatusText(null);
  };

  return (
    <DialogActions>
      <Button color="secondary" variant="contained" onClick={handleDialogClose}>
        Cancel
      </Button>
      <Button
        disabled={isExporting || (!isDm && selectedExportChannels.length === 0)}
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
  );
};

export default Actions;
