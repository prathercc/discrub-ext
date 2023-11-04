import React, { useRef } from "react";
import { Button } from "@mui/material";
import ExportMessages from "../../Export/ExportMessages/ExportMessages";
import ExportModal from "../../Modals/ExportModal/ExportModal";
import { useDispatch, useSelector } from "react-redux";
import { selectDm } from "../../../features/dm/dmSlice";
import { selectChannel } from "../../../features/channel/channelSlice";
import { selectMessage } from "../../../features/message/messageSlice";
import { selectGuild } from "../../../features/guild/guildSlice";
import {
  resetExportSettings,
  selectExport,
} from "../../../features/export/exportSlice";

const ExportButton = ({
  dialogOpen,
  setDialogOpen,
  isDm = false,
  bulk = false,
}) => {
  const dispatch = useDispatch();
  const { preFilterUserId: dmPreFilterUserId, selectedDm } =
    useSelector(selectDm);
  const { preFilterUserId, selectedChannel } = useSelector(selectChannel);
  const { isGenerating } = useSelector(selectExport);

  const {
    searchBeforeDate,
    searchAfterDate,
    searchMessageContent,
    selectedHasTypes,
    messages,
    isLoading: messagesLoading,
  } = useSelector(selectMessage);

  const { selectedGuild } = useSelector(selectGuild);
  const exportType = isDm ? "DM" : "Guild";

  const contentRef = useRef();

  const bulkDisabled =
    (isDm ? selectedDm.id === null : selectedGuild.id === null) ||
    messagesLoading ||
    selectedChannel.id !== null ||
    messages.length > 0 ||
    !!dmPreFilterUserId ||
    !!preFilterUserId ||
    !!searchBeforeDate ||
    !!searchAfterDate ||
    !!searchMessageContent ||
    !!selectedHasTypes.length ||
    dialogOpen;

  return (
    <>
      <Button
        disabled={bulk && bulkDisabled}
        onClick={async () => {
          dispatch(resetExportSettings());
          setDialogOpen(true);
        }}
        variant="contained"
      >
        Export {bulk ? exportType : "Messages"}
      </Button>
      {isGenerating && <ExportMessages componentRef={contentRef} bulk={bulk} />}
      <ExportModal
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        bulk={bulk}
        isDm={isDm}
        contentRef={contentRef}
      />
    </>
  );
};

export default ExportButton;
