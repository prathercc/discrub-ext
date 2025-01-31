import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useAppSlice } from "../../../features/app/use-app-slice";
import EnhancedTabs, {
  EnhancedTab,
} from "../../../common-components/enhanced-tabs/enhanced-tabs.tsx";
import SearchCriteria, {
  purgeCriteria,
  SearchCriteriaComponentType,
} from "../../search-criteria/search-criteria.tsx";
import PurgeContent from "./purge-content.tsx";
import Message from "../../../classes/message.ts";
import { isMessage } from "../../../app/guards.ts";
import PurgeStatusHeader from "./purge-status-header.tsx";
import { useMessageSlice } from "../../../features/message/use-message-slice.ts";

type PurgeModalProps = {
  dialogOpen: boolean;
  setDialogOpen: (val: boolean) => void;
  isDm?: boolean;
};

export type PurgedMessage = { message: Message };

export enum PurgeInstruction {
  AWAITING_INSTRUCTION = "Awaiting Instruction",
  PURGING = "Purging",
  OPERATION_COMPLETE = "Operation Complete",
  SEARCHING = "Searching",
}

const PurgeModal = ({
  dialogOpen,
  setDialogOpen,
  isDm = false,
}: PurgeModalProps) => {
  const { setSearchCriteria } = useMessageSlice();
  const [purgeInstruction, setPurgeInstruction] = useState<PurgeInstruction>(
    PurgeInstruction.AWAITING_INSTRUCTION,
  );
  const [purgedMessages, setPurgedMessages] = useState<PurgedMessage[]>([]);
  const { state: appState, resetModify, setIsModifying } = useAppSlice();
  const isPaused = appState.discrubPaused();
  const task = appState.task();
  const { active, entity } = task;
  const total = isMessage(entity) ? Number(entity?._total) : 0;

  const handleClose = () => setDialogOpen(false);

  useEffect(() => {
    if (dialogOpen) {
      resetModify();
      setIsModifying(false);
      setPurgedMessages([]);
      setPurgeInstruction(PurgeInstruction.AWAITING_INSTRUCTION);
    } else {
      setSearchCriteria({ channelIds: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen]);

  useEffect(() => {
    if (active && !entity) {
      setPurgeInstruction(PurgeInstruction.SEARCHING);
    } else if (active && isMessage(entity)) {
      setPurgeInstruction(PurgeInstruction.PURGING);
      setPurgedMessages((prevState) => [
        { message: entity },
        ...prevState
          .filter(({ message }) => message.id !== entity.id)
          .slice(0, 200),
      ]);
    } else if (!active) {
      setPurgeInstruction((prevState) =>
        [PurgeInstruction.PURGING, PurgeInstruction.SEARCHING].some(
          (pi) => pi === prevState,
        )
          ? PurgeInstruction.OPERATION_COMPLETE
          : prevState,
      );
    }
  }, [task]);

  const criteriaTab: EnhancedTab = {
    label: "Criteria",
    disabled: active,
    getComponent: () => (
      <SearchCriteria
        isDm={isDm}
        componentType={SearchCriteriaComponentType.Form}
        visibleCriteria={purgeCriteria}
      />
    ),
  };
  const purgeTab: EnhancedTab = {
    label: "Purge",
    getComponent: () => (
      <PurgeContent
        purgedMessages={purgedMessages}
        isDm={isDm}
        handleClose={handleClose}
      />
    ),
  };
  const tabs: EnhancedTab[] = [criteriaTab, purgeTab];

  return (
    <Dialog
      onClose={active ? () => {} : handleClose}
      hideBackdrop
      open={dialogOpen}
    >
      <DialogTitle>Purge Messages</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PurgeStatusHeader
          isPaused={isPaused}
          purgeInstruction={purgeInstruction}
          total={total}
        />
        <EnhancedTabs tabs={tabs} />
      </DialogContent>
    </Dialog>
  );
};

export default PurgeModal;
