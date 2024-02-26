import { Stack, Typography, LinearProgress } from "@mui/material";
import { useExportSlice } from "../../../features/export/use-export-slice";
import { useAppSlice } from "../../../features/app/use-app-slice";

const Progress = () => {
  const { state: appState } = useAppSlice();
  const task = appState.task();
  const { statusText } = task || {};

  const { state: exportState } = useExportSlice();
  const name = exportState.name();

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      sx={{ minWidth: "300px" }}
    >
      <Typography>{name}</Typography>
      <LinearProgress sx={{ width: "100%", m: 1 }} />
      <Typography variant="caption">{statusText}</Typography>
    </Stack>
  );
};

export default Progress;
