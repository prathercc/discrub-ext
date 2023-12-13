import React, { useState } from "react";
import { Alert, Avatar, Box, Snackbar } from "@mui/material";
import ExportStyles from "../Styles/Export.styles";
import PersonIcon from "@mui/icons-material/Person";
import copy from "copy-to-clipboard";
import { useSelector } from "react-redux";
import { selectExport } from "../../../features/export/exportSlice";

const AuthorAvatar = ({ message, reply, browserView }) => {
  const classes = ExportStyles({ reply, browserView });
  const author = message.getAuthor();
  const avatarId = author.getAvatar();
  const userId = author.getUserId();
  const name = author.getDisplayName() || author.getUserName();
  const { exportMaps } = useSelector(selectExport);
  const { avatarMap } = exportMaps;
  const [textCopied, setTextCopied] = useState(false);

  const handleAvatarClick = (e) => {
    if (browserView && !reply) {
      e.stopPropagation();
      copy(userId);
      setTextCopied(true);
    }
  };

  const idAndAvatar = `${userId}/${avatarId}`;
  let avatarUrl = message.getAvatarUrl();
  if (avatarMap && avatarMap[idAndAvatar] && !browserView) {
    avatarUrl = `../${avatarMap[idAndAvatar]}`;
  }

  return (
    <>
      <Box className={classes.avatarBox}>
        <Avatar
          onClick={handleAvatarClick}
          className={classes.avatarMain}
          src={avatarUrl}
        >
          <PersonIcon />
        </Avatar>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
        open={textCopied}
        onClose={() => {
          setTextCopied(false);
        }}
      >
        <Alert severity="info">
          User ID copied from <strong>{name}</strong>
        </Alert>
      </Snackbar>
    </>
  );
};
export default AuthorAvatar;
