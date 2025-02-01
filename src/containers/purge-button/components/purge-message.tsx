import { ListItem } from "@mui/material";
import Box from "@mui/material/Box";
import MessageMock from "../../message-mock/message-mock.tsx";
import PurgeMessageStatus, {
  PURGE_MESSAGE_STATUS_ID,
} from "./purge-message-status.tsx";
import { AppTaskStatus } from "../../../features/app/app-types.ts";
import { PurgeStatus } from "../../../features/purge/purge-types.ts";
import Message from "../../../classes/message.ts";

type PurgeMessageProps = {
  style: React.CSSProperties;
  message: Message & AppTaskStatus;
};

const PurgeMessage = ({ style, message }: PurgeMessageProps) => {
  return (
    <ListItem
      style={style}
      key={message.id}
      dense
      divider
      sx={{
        maxHeight: 90,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          overflow: "auto",
          height: "100%",
          "&:hover": {
            [`& #${PURGE_MESSAGE_STATUS_ID}`]: {
              opacity: "0.1 !important",
            },
          },
        }}
      >
        <MessageMock browserView index={message.id} message={message} />
        <PurgeMessageStatus status={message._status as PurgeStatus} />
      </Box>
    </ListItem>
  );
};

export default PurgeMessage;
