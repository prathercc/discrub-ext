import React, { useState } from "react";
import { Avatar, Box, Snackbar } from "@mui/material";
import ExportStyles from "../Styles/Export.styles";
import PersonIcon from "@mui/icons-material/Person";
import copy from "copy-to-clipboard";
import { useSelector } from "react-redux";
import { selectExport } from "../../../features/export/exportSlice";

const AuthorAvatar = ({ author, reply, hideAttachments }) => {
  const classes = ExportStyles({ reply, hideAttachments });
  const { showAvatars } = useSelector(selectExport);
  const [textCopied, setTextCopied] = useState(false);
  const showAvatar =
    (hideAttachments && author.avatar) ||
    (!hideAttachments && showAvatars && author.avatar);

  const handleAvatarClick = (e) => {
    if (hideAttachments && !reply) {
      e.stopPropagation();
      copy(author.id);
      setTextCopied(true);
    }
  };

  return (
    <>
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
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={5000}
        open={textCopied}
        onClose={() => {
          setTextCopied(false);
        }}
        message={
          <span>
            User ID copied from <strong>{author.username}</strong>
          </span>
        }
      />
    </>
  );
};
export default AuthorAvatar;
