import { useEffect } from "react";
import ModalDebugMessage from "./modal-debug-message";
import {
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  List,
  LinearProgress,
} from "@mui/material";
import { AppTask } from "../features/app/app-types";
import { isMessage } from "../app/guards";
import ReactionListItemButton, {
  ReactingUser,
} from "./reaction-list-item-button";
import { useExportSlice } from "../features/export/use-export-slice";
import { getEncodedEmoji, getReactingUsers } from "../utils";
import { useGuildSlice } from "../features/guild/use-guild-slice";

type ReactionModalProps = {
  task: AppTask;
  open: boolean;
  handleClose: () => void;
  handleReactionDelete: (
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    userId: string,
  ) => void;
};

const ReactionModal = ({
  task,
  open,
  handleClose,
  handleReactionDelete,
}: ReactionModalProps) => {
  const { state: exportState } = useExportSlice();
  const userMap = exportState.userMap();
  const reactionMap = exportState.reactionMap();

  const { state: guildState } = useGuildSlice();
  const selectedGuild = guildState.selectedGuild();

  const { entity, active, statusText } = task || {};

  useEffect(() => {
    if (!entity || (isMessage(entity) && entity.reactions?.length === 0)) {
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  return (
    <Dialog hideBackdrop fullWidth open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h5">Reactions</Typography>
      </DialogTitle>
      <DialogContent sx={{ height: "300px", overflow: "hidden !important" }}>
        <Stack
          sx={{ height: "100%", overflow: "auto", padding: "10px" }}
          spacing={1}
        >
          <Stack
            flexDirection="row"
            alignItems="center"
            justifyContent="space-around"
          >
            <List
              dense
              sx={{
                bgcolor: "background.paper",
                width: "100%",
                borderRadius: "5px",
              }}
            >
              {isMessage(entity) &&
                entity.reactions?.map((r) => {
                  let reactingUsers: ReactingUser[] = [];
                  const encodedEmoji = getEncodedEmoji(r.emoji);
                  const exportReactions = encodedEmoji
                    ? reactionMap[entity.id]?.[encodedEmoji]
                    : null;

                  if (encodedEmoji && exportReactions) {
                    reactingUsers = getReactingUsers(
                      exportReactions,
                      userMap,
                      selectedGuild,
                    );
                  }
                  return encodedEmoji ? (
                    <ReactionListItemButton
                      key={getEncodedEmoji(r.emoji)}
                      emoji={r.emoji}
                      reactingUsers={reactingUsers}
                      disabled={active}
                      onReactionDelete={(e) =>
                        handleReactionDelete(
                          entity.channel_id,
                          entity.id,
                          encodedEmoji,
                          e,
                        )
                      }
                    />
                  ) : null;
                })}
            </List>
          </Stack>
        </Stack>
        <ModalDebugMessage debugMessage={statusText} />
      </DialogContent>
      <DialogActions sx={{ minHeight: "57px" }}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}
        >
          {active && <LinearProgress sx={{ width: "100%", m: 1 }} />}
          <Button
            disabled={active}
            variant="contained"
            onClick={handleClose}
            color="secondary"
          >
            Close
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
export default ReactionModal;
