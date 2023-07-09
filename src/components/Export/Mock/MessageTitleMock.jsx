import React, { useContext } from "react";
import { Stack, Typography } from "@mui/material";
import { MessageContext } from "../../../context/message/MessageContext";
import { ExportContext } from "../../../context/export/ExportContext";
import { DmContext } from "../../../context/dm/DmContext";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import MessageTitleMockStyles from "./Styles/MessageTitleMock.styles";
import ExportStyles from "../Styles/Export.styles";
import { GuildContext } from "../../../context/guild/GuildContext";

const MessageTitleMock = () => {
  const classes = MessageTitleMockStyles();
  const exportClasses = ExportStyles();

  const { state: guildState } = useContext(GuildContext);
  const { selectedGuild } = guildState;

  const { state: dmState } = useContext(DmContext);
  const { selectedDm } = dmState;

  const { state: channelState } = useContext(ChannelContext);
  const { selectedChannel } = channelState;

  const entity = selectedDm.id
    ? selectedDm
    : selectedChannel.id
    ? selectedChannel
    : selectedGuild;
  const isDm = !!selectedDm.id;

  const { state: messageState } = useContext(MessageContext);
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
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={1}
        ml="10px"
      >
        <Typography className={exportClasses.typographyHash} variant="h4">
          {isDm ? "@" : selectedChannel.id ? "#" : ""}
        </Typography>
        <Typography className={exportClasses.typographyTitle} variant="h6">
          {isDm ? (
            <>
              {entity.recipients.length === 1
                ? entity.recipients[0].username
                : entity.name
                ? `Group Chat - ${entity.name}`
                : `Unnamed Group Chat - ${entity.id}`}
            </>
          ) : (
            entity?.name
          )}
        </Typography>
      </Stack>
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
