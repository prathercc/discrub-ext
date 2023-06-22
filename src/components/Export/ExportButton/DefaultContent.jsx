import React, { useContext } from "react";
import {
  DialogContent,
  DialogContentText,
  Stack,
  Typography,
} from "@mui/material";
import { MessageContext } from "../../../context/message/MessageContext";
import ImageToggle from "./ImageToggle";
import ExportButtonStyles from "./Styles/ExportButton.styles";
import { ExportContext } from "../../../context/export/ExportContext";
import Progress from "./Progress";
import PreviewImageToggle from "./PreviewImageToggle";
import ShowAvatarsToggle from "./ShowAvatarsToggle";
import PerPage from "./PerPage";

const DefaultContent = () => {
  const classes = ExportButtonStyles();

  const { state: exportState } = useContext(ExportContext);
  const { isExporting } = exportState;

  const { state: messageState } = useContext(MessageContext);

  const { filteredMessages, messages } = messageState;

  return (
    <DialogContent>
      {!isExporting && (
        <>
          <DialogContentText>
            <Typography variant="body2">
              <strong>{filteredMessages.length || messages.length}</strong>{" "}
              messages are available to export
            </Typography>
          </DialogContentText>
          <Stack
            className={classes.dialogBtnStack}
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={1}
          >
            <ShowAvatarsToggle />
            <PreviewImageToggle />
            <ImageToggle />
          </Stack>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            <PerPage />
          </Stack>
        </>
      )}
      {isExporting && <Progress />}
    </DialogContent>
  );
};

export default DefaultContent;
