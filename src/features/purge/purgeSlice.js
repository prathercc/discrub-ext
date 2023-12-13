import { createSlice } from "@reduxjs/toolkit";
import {
  deleteMessage,
  getMessageData,
  resetMessageData,
} from "../message/messageSlice";
import { liftThreadRestrictions } from "../thread/threadSlice";
import {
  checkDiscrubPaused,
  getDiscrubCancelled,
  setDiscrubCancelled,
  setIsModifying,
  setModifyEntity,
  setTimeoutMessage as notify,
} from "../app/appSlice";

export const purgeSlice = createSlice({
  name: "purge",
  initialState: {},
  reducers: {},
});

export const {} = purgeSlice.actions;

/**
 * Iterates through the provided array and deletes every message from each entity.
 * @param {Array} arr List of Channel/DM to be purged
 */
export const purge =
  (arr = []) =>
  async (dispatch, getState) => {
    const { id: userId } = getState().user;
    const { selectedGuild, preFilterUserId } = getState().guild;
    dispatch(setIsModifying(true));
    for (const entity of arr) {
      if (dispatch(getDiscrubCancelled())) break;
      await dispatch(checkDiscrubPaused());
      dispatch(setModifyEntity({}));
      await dispatch(notify("Searching for messages...", 1));
      dispatch(resetMessageData());
      await dispatch(
        getMessageData(
          selectedGuild?.id,
          entity.id,
          entity.isDm() ? userId : preFilterUserId // Discrub can only delete messages from the current user
        )
      );
      let count = 0;
      const selectedMessages = getState().message.messages;
      const selectedCount = selectedMessages.length;
      if (selectedCount === 0) {
        await dispatch(notify("Still searching...", 1));
      }

      let noPermissionThreadIds = [];
      while (count < selectedCount) {
        if (dispatch(getDiscrubCancelled())) break;
        await dispatch(checkDiscrubPaused());
        let currentRow = selectedMessages[count];

        noPermissionThreadIds = await dispatch(
          liftThreadRestrictions(
            currentRow.getChannelId(),
            noPermissionThreadIds
          )
        );

        dispatch(
          setModifyEntity(
            Object.assign(currentRow.getSafeCopy(), {
              _index: count + 1,
              _total: selectedCount,
            })
          )
        );

        const noPermissionSkip = noPermissionThreadIds.some(
          (tId) => tId === currentRow.getChannelId()
        );
        if (noPermissionSkip) {
          await dispatch(
            notify("Permission missing for message, skipping delete", 1)
          );
          count++;
        } else {
          const response = await dispatch(deleteMessage(currentRow));
          if (response === null) {
            count++;
          } else if (response > 0) {
            await dispatch(notify(`Pausing for ${response} seconds`, response));
          } else {
            await dispatch(
              notify("You do not have permission to modify this message!", 0.5)
            );
            count++;
          }
        }
      }
    }
    dispatch(setIsModifying(false));
    dispatch(setModifyEntity(null));
    dispatch(resetMessageData());
    dispatch(setDiscrubCancelled(false));
  };

export const selectPurge = (state) => state.purge;

export default purgeSlice.reducer;
