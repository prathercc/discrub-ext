import React from "react";
import { Avatar, Box } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AttachmentStyles from "./Attachment.styles";

const AttachmentFilePreview = ({ attachment }) => {
  const attachmentClasses = AttachmentStyles();

  return (
    <Box ml="5px" className={attachmentClasses.attachmentPreviewBox}>
      <Avatar
        className={attachmentClasses.attachmentAvatar}
        variant="rounded"
        src={
          attachment.content_type?.includes("image") &&
          (attachment.local_url || attachment.url)
        }
      >
        <InsertDriveFileIcon />
      </Avatar>
    </Box>
  );
};
export default AttachmentFilePreview;
