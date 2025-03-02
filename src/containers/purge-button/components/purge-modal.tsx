import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
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
import Config from "../../discrub-dialog/components/config.tsx";
import { DiscrubSetting } from "../../../enum/discrub-setting.ts";
import EnhancedDialogTitle from "../../../common-components/enhanced-dialog/enhanced-dialog-title.tsx";

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
  const {
    state: appState,
    resetModify,
    setIsModifying,
    setSettings,
    setDiscrubCancelled,
    setDiscrubPaused,
  } = useAppSlice();
  const settings = appState.settings();
  const isPaused = appState.discrubPaused();
  const task = appState.task();
  const { active, entity } = task;
  const total = Number(entity?._total);
  const offset = Number(entity?._offset);

  const handleCancel = () => {
    if (!!entity || active) {
      // We are actively deleting, we need to send a cancel request
      setDiscrubCancelled(true);
    }

    setDiscrubPaused(false);

    if (!active) {
      setDialogOpen(false);
    }
  };

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
    if (active && !isMessage(entity)) {
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

  const settingsTab: EnhancedTab = {
    label: "Settings",
    disabled: active,
    getComponent: () => (
      <Config
        settings={settings}
        visibleSettings={[
          DiscrubSetting.RANDOM_DELETE_DELAY,
          DiscrubSetting.RANDOM_SEARCH_DELAY,
          DiscrubSetting.PURGE_RETAIN_ATTACHED_MEDIA,
        ]}
        onChangeSettings={setSettings}
      />
    ),
  };

  const purgeTab: EnhancedTab = {
    label: "Purge",
    getComponent: () => (
      <PurgeContent
        purgedMessages={purgedMessages}
        isDm={isDm}
        handleCancel={handleCancel}
      />
    ),
  };
  const tabs: EnhancedTab[] = [criteriaTab, settingsTab, purgeTab];

  return (
    <Dialog
      PaperProps={{ sx: { minWidth: "500px", minHeight: "500px" } }}
      hideBackdrop
      open={dialogOpen}
    >
      <EnhancedDialogTitle title="Purge Messages" onClose={handleCancel} />
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 1,
          alignItems: "center",
        }}
      >
        <PurgeStatusHeader
          isPaused={isPaused}
          purgeInstruction={purgeInstruction}
          total={total}
          offset={offset}
        />
        <EnhancedTabs tabs={tabs} />
      </DialogContent>
    </Dialog>
  );
};

export default PurgeModal;
