import { createSlice } from "@reduxjs/toolkit";
import { wait } from "../../utils";
import {
  checkDiscrubPaused,
  deleteMessage,
  getMessageData,
  resetMessageData,
} from "../message/messageSlice";
import {
  setDm,
  setPreFilterUserId as setDmPreFilterUserId,
} from "../dm/dmSlice";
import { resetChannel, setChannel } from "../channel/channelSlice";

export const purgeSlice = createSlice({
  name: "purge",
  initialState: {
    debugMessage: null,
    deleting: false,
    deleteObj: null,
  },
  reducers: {
    setDebugMessage: (state, { payload }) => {
      state.debugMessage = payload;
    },
    setDeleting: (state, { payload }) => {
      state.deleting = payload;
    },
    setDeleteObj: (state, { payload }) => {
      state.deleteObj = payload;
    },
    resetDebugMessage: (state, { payload }) => {
      state.debugMessage = "";
    },
  },
});

export const { setDebugMessage, setDeleting, setDeleteObj, resetDebugMessage } =
  purgeSlice.actions;

/**
 * Iterates through the provided array and deletes every message from each entity.
 * @param {Array} arr List of Channel/DM to be purged
 */
export const purge =
  (arr = []) =>
  async (dispatch, getState) => {
    const { id: userId } = getState().user;
    dispatch(setDeleting(true));
    for (const entity of arr) {
      dispatch(setDeleteObj({}));
      dispatch(setDebugMessage("Searching for messages..."));
      await wait(1, () => dispatch(resetDebugMessage()));
      dispatch(resetMessageData());
      const isDm = entity.isDm();
      isDm ? dispatch(setDm(entity.id)) : dispatch(setChannel(entity.id));
      isDm && dispatch(setDmPreFilterUserId(userId));
      await wait(1); // TODO: Verify that these waits are actually needed.
      await dispatch(getMessageData());
      let count = 0;
      const selectedMessages = getState().message.messages;
      const selectedCount = selectedMessages.length;
      if (selectedCount === 0) {
        dispatch(setDebugMessage("Still searching..."));
        await wait(1, () => dispatch(resetDebugMessage()));
      }
      while (count < selectedCount) {
        // TODO: Check that we haven't cancelled task
        await dispatch(checkDiscrubPaused());
        let currentRow = selectedMessages[count];
        dispatch(
          setDeleteObj(
            Object.assign(currentRow, {
              _index: count + 1,
              _total: selectedCount,
            })
          )
        );

        const response = await dispatch(deleteMessage(currentRow));
        if (response === null) {
          count++;
        } else if (response > 0) {
          dispatch(setDebugMessage(`Pausing for ${response} seconds`));
          await wait(response, () => dispatch(resetDebugMessage()));
        } else {
          dispatch(
            setDebugMessage(
              "You do not have permission to modify this message!"
            )
          );
          await wait(0.5, () => dispatch(resetDebugMessage()));
          count++;
        }
      }
      dispatch(setDeleting(false));
      dispatch(resetMessageData());
      dispatch(resetChannel());
    }
  };

export const selectPurge = (state) => state.purge;

export default purgeSlice.reducer;
