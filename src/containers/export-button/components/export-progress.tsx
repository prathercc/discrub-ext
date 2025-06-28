import { Stack, Typography, LinearProgress } from "@mui/material";
import { useExportSlice } from "../../../features/export/use-export-slice";
import AppStatus from "../../app-status/app-status.tsx";

const ExportProgress = () => {
  const { state: exportState } = useExportSlice();
  const name = exportState.name();

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >
      <Typography>{name}</Typography>
      <LinearProgress sx={{ width: "100%", m: 1 }} />
      <AppStatus height={300} />
    </Stack>
  );
};

export default ExportProgress;
