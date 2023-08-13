import React from "react";
import { Typography, Stack, Avatar, IconButton, Box } from "@mui/material";
import Tooltip from "../../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ModalStyles from "../../Styles/Modal.styles";
import AttachmentStyles from "../../../Export/Mock/Styles/Attachment.styles";
import classNames from "classnames";

const Attachment = ({ attachment, handleDeleteAttachment, deleting }) => {
  const classes = ModalStyles();
  const attachmentClasses = AttachmentStyles({
    height: attachment?.height,
    width: attachment?.width,
    maxHeight: 150,
    maxWidth: 150,
  });

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
      className={classes.attachment}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
      >
        <Avatar
          variant="square"
          className={classNames(classes.avatar, {
            [attachmentClasses.attachmentImg]: attachment.isImage(),
          })}
          src={attachment.url}
          alt={attachment.filename}
          onClick={() => window.open(attachment.url, "_blank")}
        />
        <Tooltip title={attachment.filename}>
          <Box className={classes.ellipsisTextContainer}>
            <Typography className={classes.ellipsisText} variant="caption">
              {attachment.filename}
            </Typography>
          </Box>
        </Tooltip>
      </Stack>
      <Tooltip arrow title="Delete">
        <IconButton
          disabled={deleting}
          onClick={() => handleDeleteAttachment(attachment)}
        >
          <DeleteForeverIcon color="error" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
export default Attachment;
