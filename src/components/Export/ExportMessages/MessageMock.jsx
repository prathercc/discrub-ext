import React, { useContext } from "react";
import { Stack, Typography } from "@mui/material";
import ExportMessagesStyles from "./ExportMessages.styles";
import AttachmentMock from "./Attachment/AttachmentMock";
import AuthorAvatar from "./AuthorAvatar";
import { MessageContext } from "../../../context/message/MessageContext";

const MessageMock = ({ row, index, hideAttachments = false }) => {
  const { state: messageState } = useContext(MessageContext);
  const { threads } = messageState;
  const classes = ExportMessagesStyles();
  const messageDate = new Date(Date.parse(row.timestamp));
  const foundThread = threads?.find(
    (thread) => thread.id === row.id || thread.id === row.channel_id
  );
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="flex-start"
      spacing={1}
      className={classes.messageMockMainStack}
    >
      <AuthorAvatar author={row.author} />
      <Stack
        direction="column"
        alignItems="flex-start"
        justifyContent="flex-start"
      >
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          spacing={1}
        >
          <Typography className={classes.typographyTitle} variant="body2">
            <strong>{row.username}</strong>
          </Typography>
          <Typography
            mt="1px"
            className={classes.typographyHash}
            variant="caption"
          >
            {`${
              messageDate.getUTCMonth() + 1
            }/${messageDate.getUTCDate()}/${messageDate.getUTCFullYear()}`}{" "}
            at{" "}
            {`${messageDate.getUTCHours()}:${messageDate.getUTCMinutes()}:${messageDate.getUTCSeconds()} UTC`}
          </Typography>
        </Stack>
        {foundThread && (
          <Typography variant="caption" className={classes.typographyHash}>
            {foundThread.name}
          </Typography>
        )}
        <Typography
          className={classes.typographyMessageText}
          variant="body1"
          id={`message-data-${index}`}
        >
          {row.content}
        </Typography>
        {!hideAttachments && (
          <Stack
            mt="5px"
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
          >
            {row.attachments.map((attachment, index) => (
              <AttachmentMock attachment={attachment} />
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
export default MessageMock;
