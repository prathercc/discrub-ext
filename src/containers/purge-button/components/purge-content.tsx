import { FixedSizeList, ListChildComponentProps } from "react-window";
import { Stack } from "@mui/material";
import { useAppSlice } from "../../../features/app/use-app-slice.ts";
import CancelButton from "../../../components/cancel-button.tsx";
import PauseButton from "../../../components/pause-button.tsx";
import Button from "@mui/material/Button";
import { useMessageSlice } from "../../../features/message/use-message-slice.ts";
import { usePurgeSlice } from "../../../features/purge/use-purge-slice.ts";
import { useDmSlice } from "../../../features/dm/use-dm-slice.ts";
import Box from "@mui/material/Box";
import PurgeMessage from "./purge-message.tsx";
import { PurgedMessage } from "./purge-modal.tsx";
import { isCriteriaActive } from "../../../utils.ts";
import { useGuildSlice } from "../../../features/guild/use-guild-slice.ts";

type PurgeContentProps = {
  isDm?: boolean;
  purgedMessages: PurgedMessage[];
  handleClose: () => void;
};

const PurgeContent = ({
  isDm,
  purgedMessages,
  handleClose,
}: PurgeContentProps) => {
  const {
    state: appState,
    setDiscrubCancelled,
    setDiscrubPaused,
  } = useAppSlice();
  const task = appState.task();
  const { active, entity } = task;

  const { state: messageState } = useMessageSlice();
  const searchCriteria = messageState.searchCriteria();

  const { state: guildState } = useGuildSlice();
  const selectedGuild = guildState.selectedGuild();

  const { state: dmState } = useDmSlice();
  const selectedDms = dmState.selectedDms();

  const { purge } = usePurgeSlice();

  const handleCancel = async () => {
    if (!!entity || active) {
      // We are actively deleting, we need to send a cancel request
      setDiscrubCancelled(true);
    }

    setDiscrubPaused(false);
    if (!active) {
      handleClose();
    }
  };

  const handlePurge = () => {
    if (isDm && !!selectedDms.length) {
      purge([...selectedDms]);
    } else if (!isDm && selectedGuild) {
      purge([selectedGuild]);
    }
  };
  const getUserListItem = (props: ListChildComponentProps) => {
    const { style, index } = props;
    const { message } = purgedMessages[index];
    return <PurgeMessage style={style} message={message} />;
  };

  const purgeButtonDisabled = Boolean(
    active || entity || !isCriteriaActive(searchCriteria),
  );

  return (
    <Stack spacing={2}>
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
          itemSize={90}
          itemCount={purgedMessages.length}
        >
          {getUserListItem}
        </FixedSizeList>
      </Box>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        alignItems="center"
      >
        <CancelButton onCancel={handleCancel} />
        <PauseButton disabled={!active} />
        <Button
          disabled={purgeButtonDisabled}
          variant="contained"
          onClick={handlePurge}
        >
          Purge
        </Button>
      </Stack>
    </Stack>
  );
};

export default PurgeContent;
