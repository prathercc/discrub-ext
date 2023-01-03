import React from "react";
import { Stack, Typography } from "@mui/material";
import ExportButtonGroupStyles from "./ExportButtonGroup.styles";
import AttachmentMock from "./Attachment/AttachmentMock";
import AuthorAvatar from "./AuthorAvatar";

const MessageMock = ({ row, index, threads }) => {
  const classes = ExportButtonGroupStyles();
  const messageDate = new Date(Date.parse(row.timestamp));
  const foundThread = threads.find(
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
      </Stack>
    </Stack>
  );
};
export default MessageMock;
