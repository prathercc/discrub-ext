import React, { useState, useEffect, useRef } from "react";
import {
  Stack,
  Typography,
  Paper,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ChannelMessagesStyles from "../ChannelMessages/Styles/ChannelMessages.styles";
import NoEncryptionGmailerrorredIcon from "@mui/icons-material/NoEncryptionGmailerrorred";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector, useDispatch } from "react-redux";
import {
  getUserDataManually,
  selectUser,
} from "../../../features/user/userSlice";

function TokenNotFound() {
  const { isLoading } = useSelector(selectUser);
  const dispatch = useDispatch();

  const classes = ChannelMessagesStyles();
  const inputRef = useRef(null);

  const [token, setToken] = useState("");
  const [authFailed, setAuthFailed] = useState(false);

  const handleSubmitToken = async () => {
    const { successful } = await dispatch(getUserDataManually(token));
    if (!successful) setAuthFailed(true);
  };

  const handleTokenUpdate = (e) => {
    setToken(e.target.value);
    setAuthFailed(false);
  };

  useEffect(() => {
    if (!token) {
      inputRef.current.value = null;
    }
  }, [token]);

  return (
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
          <Typography variant="h5">Authorization Failed</Typography>
        </Stack>
        <Typography variant="caption">
          Please sign into Discord or manually enter an Authorization Token
          below:
        </Typography>
        <Stack
          sx={{ width: "100%" }}
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
          <TextField
            inputRef={inputRef}
            error={authFailed}
            helperText={
              authFailed
                ? "Session could not be found with the provided token"
                : ""
            }
            size="small"
            fullWidth
            variant="filled"
            label="Authorization Token"
            onChange={handleTokenUpdate}
            InputProps={{
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTokenUpdate({ target: { value: "" } })}
                  >
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            disabled={isLoading || !token || token.length === 0}
            onClick={handleSubmitToken}
            variant="contained"
          >
            Submit
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default TokenNotFound;
