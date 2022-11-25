import React, { useContext } from "react";
import { Stack, Typography } from "@mui/material";
import { MessageContext } from "../../context/message/MessageContext";
import ExportButtonGroupStyles from "./ExportButtonGroup.styles";
const MessageTitleMock = () => {
  const classes = ExportButtonGroupStyles();

  const { getExportTitle } = useContext(MessageContext);

  return (
    <Stack justifyContent="center" alignItems="center">
      {getExportTitle()}
      <Typography className={classes.typographyId}>
        UTC mm/dd/yyyy hh:mm:ss
      </Typography>
    </Stack>
  );
};
export default MessageTitleMock;
