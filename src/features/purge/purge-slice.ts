import { createSlice } from "@reduxjs/toolkit";
import {
  deleteMessage,
  getMessageData,
  resetMessageData,
} from "../message/message-slice";
import { liftThreadRestrictions } from "../thread/thread-slice";
import {
  isAppStopped,
  resetModify,
  setDiscrubCancelled,
  setIsModifying,
  setModifyEntity,
  setTimeoutMessage as notify,
} from "../app/app-slice";
import { PurgeState, PurgeStatus } from "./purge-types";
import { AppThunk } from "../../app/store";
import Channel from "../../classes/channel";
import Message from "../../classes/message";
import { isRemovableMessage } from "../../utils";

const initialState: PurgeState = {
  isLoading: null,
  purgeChannel: null,
};

export const purgeSlice = createSlice({
  name: "purge",
  initialState: initialState,
  reducers: {
    setIsLoading: (state, { payload }: { payload: boolean }): void => {
      state.isLoading = payload;
    },
    setPurgeChannel: (
      state,
      { payload }: { payload: Channel | null },
    ): void => {
      state.purgeChannel = payload;
    },
  },
});

export const { setIsLoading, setPurgeChannel } = purgeSlice.actions;

export const purge =
  (channels: Channel[]): AppThunk =>
  async (dispatch, getState) => {
    const { currentUser } = getState().user;
    if (currentUser) {
      const { selectedGuild } = getState().guild;
      dispatch(setIsModifying(true));
      for (const entity of channels) {
        const { discrubCancelled } = getState().app;
        if (discrubCancelled) break;
        await dispatch(checkDiscrubPaused());
        dispatch(setPurgeChannel(entity));
        dispatch(setModifyEntity(null));
        dispatch(resetMessageData());
        await dispatch(
          getMessageData(selectedGuild?.id, entity.id, {
            excludeReactions: true,
          }),
        );
        const selectedMessages: Message[] = getState().message.messages;
        const selectedCount = selectedMessages.length;
        if (selectedCount === 0) {
          await dispatch(notify({ message: "Still searching...", timeout: 1 }));
        }

        let threadIds: Snowflake[] = []; // Thread Id's that we do NOT have permission to modify
        for (const [count, currentRow] of selectedMessages.entries()) {
          const { discrubCancelled } = getState().app;
          if (discrubCancelled) break;
          await dispatch(checkDiscrubPaused());

          threadIds = await dispatch(
            liftThreadRestrictions({
              channelId: currentRow.channel_id,
              noPermissionThreadIds: threadIds,
            }),
          );

          let modifyEntity = Object.assign(new Message({ ...currentRow }), {
            _index: count + 1,
            _total: selectedCount,
            _status: PurgeStatus.IN_PROGRESS,
          });

          dispatch(setModifyEntity(modifyEntity));

          const isMissingPermission = threadIds.some(
            (tId) => tId === currentRow.channel_id,
          );
          if (isMissingPermission) {
            modifyEntity._status = PurgeStatus.MISSING_PERMISSION;
          } else if (isRemovableMessage(currentRow)) {
            const success = await dispatch(deleteMessage(currentRow));
            modifyEntity._status = success
              ? PurgeStatus.REMOVED
              : PurgeStatus.MISSING_PERMISSION;
          }
          dispatch(setModifyEntity(modifyEntity));
        }
      }
      dispatch(resetModify());
      dispatch(resetMessageData());
      dispatch(setDiscrubCancelled(false));
      dispatch(setPurgeChannel(null));
    }
  };

export default purgeSlice.reducer;
