import { PurgeInstruction } from "./purge-modal.tsx";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import ConstructionIcon from "@mui/icons-material/Construction";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CleanHandsIcon from "@mui/icons-material/CleanHands";
import SearchIcon from "@mui/icons-material/Search";
import classNames from "classnames";
import "../css/purge-status-header.css";

type PurgeStatusHeaderProps = {
  purgeInstruction: PurgeInstruction;
  index: number;
  total: number;
};

const PurgeStatusHeader = ({
  purgeInstruction,
  index,
  total,
}: PurgeStatusHeaderProps) => {
  const map = {
    [PurgeInstruction.PURGING]: {
      message: `Message ${index} of ${total}`,
      getIcon: () => <ConstructionIcon />,
    },
    [PurgeInstruction.AWAITING_INSTRUCTION]: {
      message: purgeInstruction,
      getIcon: () => <SmartToyIcon />,
    },
    [PurgeInstruction.OPERATION_COMPLETE]: {
      message: purgeInstruction,
      getIcon: () => <CleanHandsIcon />,
    },
    [PurgeInstruction.SEARCHING]: {
      message: purgeInstruction,
      getIcon: () => <SearchIcon />,
    },
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Box
        className={classNames({
          "operation-running": [
            PurgeInstruction.PURGING,
            PurgeInstruction.SEARCHING,
          ].some((pi) => pi === purgeInstruction),
        })}
      >
        {map[purgeInstruction].getIcon()}
      </Box>
      <Typography variant="h6">{map[purgeInstruction].message}</Typography>
    </Box>
  );
};

export default PurgeStatusHeader;
