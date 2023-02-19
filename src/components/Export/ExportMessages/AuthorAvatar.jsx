import React from "react";
import { Avatar, Box } from "@mui/material";
import ExportMessagesStyles from "./ExportMessages.styles";
import PersonIcon from "@mui/icons-material/Person";

const AuthorAvatar = ({ author }) => {
  const classes = ExportMessagesStyles();

  return (
    <Box className={classes.avatarBox}>
      <Avatar
        className={classes.avatarMain}
        src={
          author.avatar &&
          `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png`
        }
      >
        <PersonIcon />
      </Avatar>
    </Box>
  );
};
export default AuthorAvatar;
