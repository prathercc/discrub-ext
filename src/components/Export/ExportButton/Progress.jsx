import React, { useContext } from "react";
import { Stack, CircularProgress, Typography } from "@mui/material";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportButtonStyles from "./Styles/ExportButton.styles";
import { ExportContext } from "../../../context/export/ExportContext";

const Progress = () => {
  const classes = ExportButtonStyles();

  const { state: exportState } = useContext(ExportContext);
  const { name, statusText } = exportState;
  const { state: messageState } = useContext(MessageContext);
  const { fetchedMessageLength } = messageState;

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
        {statusText || (
          <>
            {fetchedMessageLength
              ? `${fetchedMessageLength} Messages Found`
              : "Processing"}
          </>
        )}
      </Typography>
    </Stack>
  );
};

export default Progress;
