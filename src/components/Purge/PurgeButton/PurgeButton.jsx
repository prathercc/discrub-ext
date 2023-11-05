import React, { useRef } from "react";
import { Button } from "@mui/material";
import PurgeModal from "../../Modals/PurgeModal/PurgeModal";
import { useSelector } from "react-redux";
import { selectGuild } from "../../../features/guild/guildSlice";
import { selectChannel } from "../../../features/channel/channelSlice";
import { selectDm } from "../../../features/dm/dmSlice";
import { selectMessage } from "../../../features/message/messageSlice";

const PurgeButton = ({ dialogOpen, setDialogOpen, isDm = false }) => {
  const openRef = useRef();
  openRef.current = dialogOpen;

  const { selectedGuild } = useSelector(selectGuild);
  const { selectedChannel, preFilterUserId } = useSelector(selectChannel);
  const { selectedDm, preFilterUserId: dmPreFilterUserId } =
    useSelector(selectDm);
  const {
    isLoading: messagesLoading,
    searchAfterDate,
    searchBeforeDate,
    searchMessageContent,
    selectedHasTypes,
    messages,
  } = useSelector(selectMessage);

  const messagesRef = useRef();
  messagesRef.current = messages;

  const messagesLoadingRef = useRef();
  messagesLoadingRef.current = messagesLoading;

  const disabled =
    (!selectedGuild.id && !selectedDm.id) ||
    selectedChannel.id ||
    messages.length > 0 ||
    [
      dmPreFilterUserId,
      preFilterUserId,
      searchBeforeDate,
      searchAfterDate,
      searchMessageContent,
      selectedHasTypes.length,
      dialogOpen,
      messagesLoading,
    ].some((prop) => !!prop);

  return (
    <>
      <Button
        disabled={disabled}
        onClick={() => {
          if (selectedGuild.id || selectedDm.id) {
            setDialogOpen(true);
          }
        }}
        variant="contained"
      >
        Purge
      </Button>
      <PurgeModal
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        isDm={isDm}
      />
    </>
  );
};

export default PurgeButton;
