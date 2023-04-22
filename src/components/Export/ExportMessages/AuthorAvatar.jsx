import React, { useContext } from "react";
import { Avatar, Box } from "@mui/material";
import ExportMessagesStyles from "./ExportMessages.styles";
import PersonIcon from "@mui/icons-material/Person";
import { ExportContext } from "../../../context/export/ExportContext";
import copy from "copy-to-clipboard";

const AuthorAvatar = ({ author, reply, hideAttachments }) => {
  const classes = ExportMessagesStyles({ reply, hideAttachments });
  const { state: exportState } = useContext(ExportContext);
  const { showAvatars } = exportState;
  const showAvatar =
    (hideAttachments && author.avatar) ||
    (!hideAttachments && showAvatars && author.avatar);

  const handleAvatarClick = (e) => {
    if (hideAttachments) {
      e.stopPropagation();
      copy(author.id);
    }
  };

  return (
    <Box className={classes.avatarBox}>
      <Avatar
        onClick={handleAvatarClick}
        className={classes.avatarMain}
        src={
          showAvatar &&
          `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`
        }
      >
        <PersonIcon />
      </Avatar>
    </Box>
  );
};
export default AuthorAvatar;
