import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import NoEncryptionIcon from "@mui/icons-material/NoEncryption";
import SyncIcon from "@mui/icons-material/Sync";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import BlurOffIcon from "@mui/icons-material/BlurOff";
import { PurgeStatus } from "../../../features/purge/purge-types.ts";
import "../css/purge-message-status.css";
import classNames from "classnames";

export const PURGE_MESSAGE_STATUS_ID = "purge-message-status";

type PurgeMessageStatusProps = {
  status?: PurgeStatus;
};

const PurgeMessageStatus = ({
  status = PurgeStatus.IN_PROGRESS,
}: PurgeMessageStatusProps) => {
  const map = {
    [PurgeStatus.IN_PROGRESS]: {
      color: "info.dark",
      getIcon: () => <SyncIcon />,
    },
    [PurgeStatus.MISSING_PERMISSION]: {
      color: "warning.dark",
      getIcon: () => <NoEncryptionIcon />,
    },
    [PurgeStatus.MESSAGE_NON_REMOVABLE]: {
      color: "warning.dark",
      getIcon: () => <NoEncryptionIcon />,
    },
    [PurgeStatus.REACTIONS_PARTIALLY_REMOVED]: {
      color: "warning.dark",
      getIcon: () => <NoEncryptionIcon />,
    },
    [PurgeStatus.REMOVED]: {
      color: "success.dark",
      getIcon: () => <DeleteIcon />,
    },
    [PurgeStatus.ATTACHMENTS_KEPT]: {
      color: "success.dark",
      getIcon: () => <AttachFileIcon />,
    },
    [PurgeStatus.REACTIONS_REMOVED]: {
      color: "success.dark",
      getIcon: () => <AddReactionIcon />,
    },
    [PurgeStatus.NO_REACTIONS_FOUND]: {
      color: "success.dark",
      getIcon: () => <BlurOffIcon />,
    },
  };

  return (
    <Box
      id={PURGE_MESSAGE_STATUS_ID}
      gap={0.5}
      sx={{
        bgcolor: map[status].color,
        width: "50%",
        height: "35px",
        borderRadius: "15px",
        position: "absolute",
        top: "35%",
        left: "25%",
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "7px 10px 5px 0px rgba(0,0,0,0.35)",
        transition: "all .2s ease-in-out",
      }}
    >
      <Box
        className={classNames({
          "in-progress": status === PurgeStatus.IN_PROGRESS,
        })}
      >
        {map[status].getIcon()}
      </Box>
      <Typography variant="h6">{status}</Typography>
    </Box>
  );
};

export default PurgeMessageStatus;
