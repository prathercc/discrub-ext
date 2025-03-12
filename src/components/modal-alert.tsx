import { Alert, AlertColor, Snackbar } from "@mui/material";

const ModalAlert = ({
  debugMessage,
  severity,
}: {
  debugMessage: string | Maybe;
  severity?: AlertColor;
}) => {
  return (
    <Snackbar
      sx={{ opacity: !!debugMessage ? 1 : 0 }}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      autoHideDuration={2000}
      open={!!debugMessage}
    >
      <Alert variant="filled" severity={severity ?? "info"}>
        <span>{debugMessage}</span>
      </Alert>
    </Snackbar>
  );
};
export default ModalAlert;
