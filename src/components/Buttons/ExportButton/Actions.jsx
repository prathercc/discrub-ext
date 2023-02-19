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
    setIsGenerating,
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
  const { messages: contextMessages, filteredMessages } = messageState;
  const { channels, selectedExportChannels, selectedChannel } = channelState;
  const { selectedDm } = dmState;
  const exportingActiveRef = useRef();
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
    setIsGenerating,
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

  const _processMessages = async (addToFolder, messages, attachmentFolder) => {
    const processMessage = async (message) => {
      let updatedMessage = message;
      if (attachmentFolder) {
        for (let c2 = 0; c2 < updatedMessage.attachments.length; c2 += 1) {
          if (isExportCancelled()) break;
          try {
            const attachment = updatedMessage.attachments[c2];
            const blob = await fetch(attachment.proxy_url).then((r) =>
              r.blob()
            );
            if (blob.size) {
              const cleanFileName = addToFolder(
                attachmentFolder,
                blob,
                attachment.filename
              );
              updatedMessage.attachments[c2] = {
                ...updatedMessage.attachments[c2],
                local_url: `${attachmentFolder.name}/${cleanFileName}`,
              };
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      return updatedMessage;
    };
    const retArr = [];
    for (let c1 = 0; c1 < messages.length; c1 += 1) {
      if (c1 === 0) {
        await new Promise((resolve) =>
          setTimeout(() => {
            resolve();
          }, 5000)
        );
      }
      if (isExportCancelled()) break;
      retArr.push(await processMessage(messages[c1]));
    }

    return retArr;
  };
  const _compressMessages = async (updatedMessages, format, entityName) => {
    setStatusText(
      `Compressing${
        updatedMessages.length > 2000 ? " - This may take a few minutes" : ""
      }`
    );
    if (format === "json")
      return addToZip(
        new Blob([JSON.stringify(updatedMessages)], {
          type: "text/plain",
        }),
        entityName
      );
    else {
      const htmlBlob = await generateHTML();
      return addToZip(htmlBlob, entityName, "html");
    }
  };

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

      const updatedMessages = await _processMessages(
        addToFolder,
        messages,
        attachmentFolder
      );

      if (updatedMessages.length > 0) {
        if (isExportCancelled()) break;
        await _compressMessages(updatedMessages, format, entity.name);
      }

      count += 1;
      if (isExportCancelled()) break;
    }
    if (!isExportCancelled()) {
      setStatusText("Preparing Archive");
      await generateZip();
      if (bulk) await resetChannel();
      if (bulk) await resetMessageData();
    }
    setIsGenerating(false);
    setIsExporting(false);
    setName("");
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
        <MenuItem dense onClick={() => handleExportSelected("json")}>
          JSON
        </MenuItem>
      </Menu>
    </DialogActions>
  );
};

export default Actions;
