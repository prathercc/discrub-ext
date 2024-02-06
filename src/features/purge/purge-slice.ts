import { createSlice } from "@reduxjs/toolkit";
import {
  deleteMessage,
  getMessageData,
  resetMessageData,
} from "../message/message-slice";
import { liftThreadRestrictions } from "../thread/thread-slice";
import {
  checkDiscrubPaused,
  setDiscrubCancelled,
  setIsModifying,
  setModifyEntity,
  setTimeoutMessage as notify,
  resetModify,
} from "../app/app-slice";
import { PurgeState } from "./purge-types";
import { AppThunk } from "../../app/store";
import Channel from "../../classes/channel";
import Message from "../../classes/message";
import { isDm } from "../../utils";

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
      { payload }: { payload: Channel | null }
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
      const { selectedGuild, preFilterUserId } = getState().guild;
      dispatch(setIsModifying(true));
      for (const entity of channels) {
        const { discrubCancelled } = getState().app;
        if (discrubCancelled) break;
        await dispatch(checkDiscrubPaused());
        dispatch(setPurgeChannel(entity));
        dispatch(setModifyEntity(null));
        await dispatch(
          notify({ message: "Searching for messages...", timeout: 1 })
        );
        dispatch(resetMessageData());
        await dispatch(
          getMessageData(
            selectedGuild?.id,
            entity.id,
            isDm(entity) ? currentUser.id : preFilterUserId // Discrub can only delete messages from the current user
          )
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
            })
          );

          const modifyEntity = Object.assign(new Message({ ...currentRow }), {
            _index: count + 1,
            _total: selectedCount,
          });

          dispatch(setModifyEntity(modifyEntity));

          const isMissingPermission = threadIds.some(
            (tId) => tId === currentRow.channel_id
          );
          if (isMissingPermission) {
            await dispatch(
              notify({
                message: "Permission missing for message, skipping delete",
                timeout: 1,
              })
            );
          } else {
            const success = await dispatch(deleteMessage(currentRow));
            if (!success) {
              await dispatch(
                notify({
                  message: "You do not have permission to modify this message!",
                  timeout: 0.5,
                })
              );
            }
          }
        }
      }
      dispatch(resetModify());
      dispatch(resetMessageData());
      dispatch(setDiscrubCancelled(false));
      dispatch(setPurgeChannel(null));
    }
  };

export default purgeSlice.reducer;
