import React from "react";
import { Stack, CircularProgress, Typography } from "@mui/material";
import ExportButtonStyles from "../Styles/ExportButton.styles";
import { useSelector } from "react-redux";
import { selectExport } from "../../../../features/export/exportSlice";
import { selectMessage } from "../../../../features/message/messageSlice";

const Progress = () => {
  const classes = ExportButtonStyles();
  const { name, statusText } = useSelector(selectExport);
  const { fetchProgress, lookupUserId } = useSelector(selectMessage);
  const { messageCount, threadCount, parsingThreads } = fetchProgress || {};

  const getProgressText = () => {
    return (
      <>
        {parsingThreads && <>{threadCount} Threads Found</>}
        {!parsingThreads && !lookupUserId && (
          <>{messageCount ? `${messageCount} Messages Found` : "Processing"}</>
        )}
        {lookupUserId && `User Lookup: ${lookupUserId}`}
      </>
    );
  };

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      className={classes.dialogStatusStack}
    >
      <Typography>{name}</Typography>
      <CircularProgress />
      <Typography variant="caption">
        {statusText || getProgressText()}
      </Typography>
    </Stack>
  );
};

export default Progress;
