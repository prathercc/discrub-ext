import React, { useContext, useRef } from "react";
import { Button } from "@mui/material";
import { GuildContext } from "../../../context/guild/GuildContext";
import { MessageContext } from "../../../context/message/MessageContext";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import { DmContext } from "../../../context/dm/DmContext";
import PurgeModal from "../../Modals/PurgeModal/PurgeModal";

const PurgeButton = ({ dialogOpen, setDialogOpen, isDm = false }) => {
  const openRef = useRef();
  openRef.current = dialogOpen;

  const { state: guildState } = useContext(GuildContext);
  const { state: channelState } = useContext(ChannelContext);

  const { state: dmState } = useContext(DmContext);

  const { state: messageDataState } = useContext(MessageContext);

  const {
    messages,
    isLoading: messagesLoading,
    searchBeforeDate,
    searchAfterDate,
  } = messageDataState;
  const { selectedGuild } = guildState;
  const { selectedChannel, preFilterUserId } = channelState;
  const { selectedDm, preFilterUserId: dmPreFilterUserId } = dmState;

  const messagesRef = useRef();
  messagesRef.current = messages;

  const messagesLoadingRef = useRef();
  messagesLoadingRef.current = messagesLoading;

  const disabled =
    (selectedGuild.id === null && selectedDm.id === null) ||
    selectedChannel.id !== null ||
    messages.length > 0 ||
    [
      dmPreFilterUserId,
      preFilterUserId,
      searchBeforeDate,
      searchAfterDate,
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
