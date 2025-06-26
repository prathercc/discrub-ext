import {
  Stack,
  Typography,
  LinearProgress,
  Box,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useExportSlice } from "../../../features/export/use-export-slice";
import { useAppSlice } from "../../../features/app/use-app-slice";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { useEffect, useState } from "react";

const Progress = () => {
  const { state: appState } = useAppSlice();
  const task = appState.task();
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const { statusText } = task || {};

  const { state: exportState } = useExportSlice();
  const name = exportState.name();

  useEffect(() => {
    if (statusText) {
      setStatusMessages((prevState) =>
        [statusText, ...prevState].slice(0, 200),
      );
    }
  }, [statusText]);

  const getUserListItem = (props: ListChildComponentProps) => {
    const { index, style } = props;
    return (
      <ListItem
        dense
        style={style}
        key={statusMessages[index]}
        sx={{
          height: 30,
          whiteSpace: "nowrap",
        }}
      >
        <ListItemText>{statusMessages[index]}</ListItemText>
      </ListItem>
    );
  };

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
      <Box
        sx={{
          width: "100%",
          maxWidth: 500,
          height: 300,
          backgroundColor: "background.paper",
        }}
      >
        <FixedSizeList
          height={300}
          width={500}
          itemSize={30}
          itemCount={statusMessages.length}
        >
          {getUserListItem}
        </FixedSizeList>
      </Box>
    </Stack>
  );
};

export default Progress;
