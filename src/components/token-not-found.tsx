import { useState, useEffect, useRef } from "react";
import {
  Stack,
  Typography,
  Paper,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import NoEncryptionGmailerrorredIcon from "@mui/icons-material/NoEncryptionGmailerrorred";
import CloseIcon from "@mui/icons-material/Close";
import { useUserSlice } from "../features/user/use-user-slice";

function TokenNotFound() {
  const { state: userState, getUserDataManaully } = useUserSlice();
  const isLoading = userState.isLoading();

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | Maybe>(null);

  const [token, setToken] = useState("");
  const [authFailed, setAuthFailed] = useState(false);

  const handleSubmitToken = async () => {
    const successful = await getUserDataManaully(token);
    if (!successful) setAuthFailed(true);
  };

  const handleTokenUpdate = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setToken(e.target.value);
    setAuthFailed(false);
  };

  const handleClearToken = () => {
    setToken("");
    setAuthFailed(false);
  };

  useEffect(() => {
    if (!token && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [token]);

  return (
    <Paper sx={{ justifyContent: "center", padding: "10px" }}>
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
                  <IconButton onClick={() => handleClearToken()}>
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
