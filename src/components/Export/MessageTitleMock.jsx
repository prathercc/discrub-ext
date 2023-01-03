import React, { useContext } from "react";
import { Stack } from "@mui/material";
import { MessageContext } from "../../context/message/MessageContext";
import ExportButtonGroupStyles from "./ExportButtonGroup.styles";
import PoweredBy from "./PoweredBy";

const MessageTitleMock = () => {
  const classes = ExportButtonGroupStyles();

  const { getExportTitle } = useContext(MessageContext);

  return (
    <Stack
      className={classes.exportTitleStack}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      {getExportTitle()}
      <PoweredBy />
    </Stack>
  );
};
export default MessageTitleMock;
