import React from "react";
import { Avatar, Box } from "@mui/material";
import ExportButtonGroupStyles from "./ExportButtonGroup.styles";
import PersonIcon from "@mui/icons-material/Person";

const AuthorAvatar = ({ author }) => {
  const classes = ExportButtonGroupStyles();

  return (
    <Box className={classes.avatarBox}>
      <Avatar
        className={classes.avatarMain}
        src={`https://cdn.discordapp.com/avatars/${author?.id}/${author?.avatar}.png`}
      />
      <Avatar className={classes.avatarFallback}>
        <PersonIcon />
      </Avatar>
    </Box>
  );
};
export default AuthorAvatar;
