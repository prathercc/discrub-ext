import React, { useContext } from "react";
import { DialogContent, DialogContentText, Stack } from "@mui/material";
import { MessageContext } from "../../../context/message/MessageContext";
import ImageToggle from "./ImageToggle";
import ExportButtonStyles from "./ExportButton.styles";
import { ExportContext } from "../../../context/export/ExportContext";
import Progress from "./Progress";

const DefaultContent = () => {
  const classes = ExportButtonStyles();

  const { state: exportState } = useContext(ExportContext);
  const { isExporting } = exportState;

  const { state: messageState } = useContext(MessageContext);

  const { filteredMessages, messages } = messageState;

  return (
    <DialogContent>
      <DialogContentText>
        <strong>{filteredMessages.length || messages.length}</strong> messages
        are available to export
      </DialogContentText>
      <Stack
        className={classes.dialogBtnStack}
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
      >
        <ImageToggle />
      </Stack>

      {isExporting && <Progress />}
    </DialogContent>
  );
};

export default DefaultContent;