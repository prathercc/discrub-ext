import React, { useContext } from "react";
import { Avatar, Box } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AttachmentStyles from "./Attachment.styles";
import { ExportContext } from "../../../../context/export/ExportContext";

const AttachmentFilePreview = ({ attachment }) => {
  const attachmentClasses = AttachmentStyles();
  const { state: exportState } = useContext(ExportContext);
  const { previewImages } = exportState;

  return (
    <Box ml="5px" className={attachmentClasses.attachmentPreviewBox}>
      <Avatar
        className={attachmentClasses.attachmentAvatar}
        variant="rounded"
        src={
          attachment.content_type?.includes("image") &&
          previewImages &&
          (attachment.local_url || attachment.url)
        }
      >
        <InsertDriveFileIcon />
      </Avatar>
    </Box>
  );
};
export default AttachmentFilePreview;
