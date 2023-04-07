import React, { useContext } from "react";
import { Stack, Typography, Paper } from "@mui/material";
import { UserContext } from "../../context/user/UserContext";
import ChannelMessagesStyles from "../ChannelMessages/ChannelMessages.styles";
import NoEncryptionGmailerrorredIcon from "@mui/icons-material/NoEncryptionGmailerrorred";

function TokenNotFound() {
  const { state: userState } = useContext(UserContext);

  const classes = ChannelMessagesStyles();

  const { token } = userState;
  return (
    <>
      {token === undefined && (
        <Paper justifyContent="center" className={classes.paper}>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={1}
            >
              <NoEncryptionGmailerrorredIcon />
              <Typography variant="h5">Authentication Failed</Typography>
            </Stack>
            <Typography variant="caption">
              You must be signed into Discord to use this extension
            </Typography>
          </Stack>
        </Paper>
      )}
    </>
  );
}

export default TokenNotFound;
