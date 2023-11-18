import React from "react";
import {
  DialogContent,
  DialogContentText,
  Stack,
  Typography,
} from "@mui/material";
import ImageToggle from "../ImageToggle/ImageToggle";
import ExportButtonStyles from "../Styles/ExportButton.styles";
import Progress from "../Progress/Progress";
import PreviewImageToggle from "../PreviewImageToggle/PreviewImageToggle";
import ShowAvatarsToggle from "../ShowAvatarsToggle/ShowAvatarsToggle";
import PerPage from "../PerPage/PerPage";
import { useSelector } from "react-redux";
import { selectExport } from "../../../../features/export/exportSlice";
import { selectMessage } from "../../../../features/message/messageSlice";

const DefaultContent = () => {
  const classes = ExportButtonStyles();

  const { isExporting } = useSelector(selectExport);
  const { filteredMessages, messages } = useSelector(selectMessage);

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
          <Stack direction="row" justifyContent="flex-end" mt={1} mb={1}>
            <Stack
              className={classes.exportOptions}
              direction="column"
              spacing={1}
              alignItems="center"
            >
              <Typography variant="body2">Export Options</Typography>
              <Stack
                className={classes.dialogBtnStack}
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <ShowAvatarsToggle />
                <PreviewImageToggle />
                <ImageToggle />
              </Stack>
            </Stack>
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
