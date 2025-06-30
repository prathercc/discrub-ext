import { Box, ListItem, ListItemText } from "@mui/material";
import { useAppSlice } from "../../features/app/use-app-slice";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { useEffect, useState } from "react";

type AppStatusType = { height: number };

const AppStatus = ({ height }: AppStatusType) => {
  const { state: appState } = useAppSlice();
  const task = appState.task();
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const { statusText } = task || {};

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
    <Box
      sx={{
        height: height,
        width: "100%",
        backgroundColor: "background.paper",
      }}
    >
      <FixedSizeList
        height={height}
        width="100%"
        itemSize={30}
        itemCount={statusMessages.length}
      >
        {getUserListItem}
      </FixedSizeList>
    </Box>
  );
};

export default AppStatus;
