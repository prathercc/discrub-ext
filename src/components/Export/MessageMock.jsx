import React from "react";
import { Stack, Typography } from "@mui/material";
import ExportButtonGroupStyles from "./ExportButtonGroup.styles";

const MessageMock = ({ row, index, threads }) => {
  const classes = ExportButtonGroupStyles();
  const messageDate = new Date(Date.parse(row.timestamp));
  const foundThread = threads.find(
    (thread) => thread.id === row.id || thread.id === row.channel_id
  );
  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      className={classes.stackContentContainer}
      my={1}
      padding={1}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={20}
        className={classes.stack}
      >
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          spacing={0}
        >
          <Typography className={classes.boldTypography}>
            {row.username}:
          </Typography>
          <Typography className={classes.typography}>{`${
            messageDate.getUTCMonth() + 1
          }/${messageDate.getUTCDate()}/${messageDate.getUTCFullYear()}`}</Typography>
          <Typography
            className={classes.typography}
          >{`${messageDate.getUTCHours()}:${messageDate.getUTCMinutes()}:${messageDate.getUTCSeconds()}`}</Typography>
          <Typography className={classes.typographyId}>
            Message ID: {row.id}
          </Typography>
          {foundThread && (
            <>
              <Typography className={classes.typographyId}>
                Thread Name {foundThread.name}
              </Typography>
              <Typography className={classes.typographyId}>
                Thread ID: {foundThread.id}
              </Typography>
            </>
          )}
        </Stack>
        <Typography className={classes.typography} id={`message-data-${index}`}>
          {row.content}
        </Typography>
      </Stack>
      {row.attachments?.length > 0 ? (
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="flex-start"
          spacing={1}
          className={classes.stack}
        >
          {row.attachments.map((attachment, index) => (
            <Typography className={classes.typography}>
              <a href={attachment.url}>Attachment {index + 1}</a>
            </Typography>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
};
export default MessageMock;
