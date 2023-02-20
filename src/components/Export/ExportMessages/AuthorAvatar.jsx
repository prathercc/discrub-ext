import React, { useContext } from "react";
import { Avatar, Box } from "@mui/material";
import ExportMessagesStyles from "./ExportMessages.styles";
import PersonIcon from "@mui/icons-material/Person";
import { ExportContext } from "../../../context/export/ExportContext";

const AuthorAvatar = ({ author, reply }) => {
  const classes = ExportMessagesStyles({ reply });
  const { state: exportState } = useContext(ExportContext);
  const { showAvatars } = exportState;

  return (
    <Box className={classes.avatarBox}>
      <Avatar
        className={classes.avatarMain}
        src={
          author.avatar &&
          showAvatars &&
          `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`
        }
      >
        <PersonIcon />
      </Avatar>
    </Box>
  );
};
export default AuthorAvatar;
