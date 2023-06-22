import React, { useContext } from "react";
import { Stack, Typography } from "@mui/material";
import { MessageContext } from "../../../context/message/MessageContext";
import { ExportContext } from "../../../context/export/ExportContext";
import MessageTitleMockStyles from "./Styles/MessageTitleMock.styles";
import ExportStyles from "../Styles/Export.styles";

const MessageTitleMock = () => {
  const classes = MessageTitleMockStyles();
  const exportClasses = ExportStyles();

  const { getExportTitle, state: messageState } = useContext(MessageContext);
  const { filteredMessages, messages } = messageState;
  const { state: exportState } = useContext(ExportContext);
  const { currentPage, messagesPerPage } = exportState;
  const pageTitle = `Page ${currentPage} of ${Math.ceil(
    (filteredMessages.length ? filteredMessages.length : messages.length) /
      messagesPerPage
  )}`;

  return (
    <Stack
      className={classes.exportTitleStack}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      {getExportTitle()}
      <Typography className={exportClasses.typographyTitle} variant="h6">
        {pageTitle}
      </Typography>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        mr="10px"
        className={classes.poweredByStack}
      >
        <Typography className={exportClasses.typographyTitle} variant="caption">
          Generated with <strong>Discrub</strong>
        </Typography>
        <img
          draggable={false}
          style={{ width: "24px", height: "24px" }}
          src="https://i92.servimg.com/u/f92/11/29/62/29/discru10.png"
          alt="Discrub Logo"
        />
      </Stack>
    </Stack>
  );
};
export default MessageTitleMock;
