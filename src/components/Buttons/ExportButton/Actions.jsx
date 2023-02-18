import React, { useState, useContext, useRef } from "react";
import { Button, Menu, MenuItem, DialogActions } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportUtils from "../../Export/ExportUtils";
import { DmContext } from "../../../context/dm/DmContext";
import { ExportContext } from "../../../context/export/ExportContext";

const Actions = ({ setDialogOpen, isDm, contentRef, bulk }) => {
  const {
    state: exportState,
    setName,
    setIsExporting,
    setStatusText,
    processMessages,
    incrementProcessingTime,
  } = useContext(ExportContext);
  const {
    downloadImages,
    isExporting,
    isProcessing,
    processedMessages,
    processingTime,
  } = exportState;

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
  const { messages: contextMessages, filteredMessages } = messageState;
  const { channels, selectedExportChannels, selectedChannel } = channelState;
  const { selectedDm } = dmState;
  const exportingActiveRef = useRef();
  const processedMessagesRef = useRef();
  const isProcessingRef = useRef();
  const processingTimeRef = useRef();
  isProcessingRef.current = isProcessing;
  processedMessagesRef.current = processedMessages;
  exportingActiveRef.current = isExporting;
  processingTimeRef.current = processingTime;
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
    () => {},
    `message-data-${contextMessages.length - 1}`
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
    if (bulk) {
      setSelectedExportChannels([]);
      resetChannel();
      resetMessageData();
    }
    setName("");
    setIsExporting(false);
  };

  const isExportCancelled = () => !exportingActiveRef.current;

  const handleExportSelected = async (format = "json") => {
    handleClose();
    const selectedChannels = isDm
      ? [selectedDm]
      : bulk
      ? channels.filter((c) => selectedExportChannels.some((id) => id === c.id))
      : [selectedChannel];
    let count = 0;
    while (count < selectedChannels.length) {
      const entity = selectedChannels[count];
      await setIsExporting(true);
      await setName(entity.name);
      if (bulk) !isDm && (await setChannel(entity.id));
      const { messages } = bulk
        ? await getMessageData()
        : {
            messages: filteredMessages.length
              ? filteredMessages
              : contextMessages,
          };
      const attachmentFolder = downloadImages
        ? createZipFolder(`${entity.name}_images`)
        : null;

      processMessages(addToFolder, messages, attachmentFolder);
      while (isProcessingRef.current) {
        incrementProcessingTime();
        setStatusText(
          `Elapsed Processing Time: ${processingTimeRef.current} second${
            processedMessagesRef.current === 1 ? "" : "s"
          }`
        );
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve();
          }, 1000)
        );
      }
      const updatedMessages = processedMessagesRef.current;

      if (updatedMessages.length > 0) {
        if (isExportCancelled()) break;
        setStatusText("Adding data to archive");
        if (format === "json")
          addToZip(
            new Blob([JSON.stringify(updatedMessages)], {
              type: "text/plain",
            }),
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
      if (bulk) await resetChannel();
      if (bulk) await resetMessageData();
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
        disabled={
          isExporting || (bulk && !isDm && selectedExportChannels.length === 0)
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
  );
};

export default Actions;
