import { createSlice } from "@reduxjs/toolkit";
import { editChannel, fetchThreads } from "../../services/discordService";
import { wait } from "../../utils";
import Thread from "../../classes/Thread";
import { checkDiscrubPaused, getDiscrubCancelled } from "../app/appSlice";

export const threadSlice = createSlice({
  name: "thread",
  initialState: {
    threads: [],
  },
  reducers: {
    setThreads: (state, { payload }) => {
      state.threads = payload;
    },
    resetThreads: (state, { payload }) => {
      state.threads = [];
    },
  },
});

export const { setThreads, resetThreads } = threadSlice.actions;

export const getArchivedThreads =
  (channelId, knownThreads) => async (dispatch, getState) => {
    const { token } = getState().user;
    try {
      if (!dispatch(getDiscrubCancelled())) {
        return (await fetchThreads(token, channelId))
          .filter((at) => !knownThreads.some((kt) => kt.id === at.id))
          .map((at) => new Thread(at));
      }
    } catch (e) {
      console.error(e);
      return [];
    }
  };

export const getThreadsFromMessages = (messages, knownThreads) => {
  return messages
    .filter((m) => m.thread && m.thread.id)
    .map((m) => new Thread(m.thread))
    .filter((t) => !knownThreads.some((kt) => kt.id === t.id));
};

export const unarchiveThread = (threadId) => async (dispatch, getState) => {
  if (threadId) {
    const { token } = getState().user;
    try {
      const data = await editChannel(token, threadId, {
        archived: false,
        locked: false,
      });
      if (!data.message) {
        const { threads } = getState().thread;
        const foundThread = threads.find((t) => t.getId() === threadId);
        if (foundThread) {
          foundThread.unarchive();
          dispatch(
            setThreads(
              threads.map((thread) => {
                if (thread.getId() === foundThread.getId()) {
                  return foundThread;
                } else return thread;
              })
            )
          );
        }

        return null;
      } else if (data.retry_after) {
        return data.retry_after;
      } else {
        return -1;
      }
    } catch (e) {
      console.error(e);
      return -1;
    }
  }
};

/**
 *
 * @param {string} threadId The Id of the Thread to lift locked/archived restrictions from
 * @param {Array} noPermissionThreadIds Optional array of Thread Ids that could not be unlocked
 * @returns An updated array of Thread Ids.
 */
export const liftThreadRestrictions =
  (threadId, noPermissionThreadIds = []) =>
  async (dispatch, getState) => {
    const foundThread = getState().thread.threads.find(
      (t) => t.id === threadId
    );
    const retArr = [...noPermissionThreadIds];
    const removeRestriction =
      foundThread &&
      foundThread.getLockedOrArchived() &&
      !noPermissionThreadIds.some((tId) => tId === foundThread.getId());
    if (removeRestriction) {
      let finished = false;
      while (!finished && !dispatch(getDiscrubCancelled())) {
        await dispatch(checkDiscrubPaused());
        const response = await dispatch(unarchiveThread(foundThread.getId()));

        if (response === null) {
          finished = true;
        } else if (response > 0) {
          await wait(response);
        } else {
          finished = true;
          retArr.push(foundThread.getId());
        }
      }
    }
    return retArr;
  };

export const selectThread = (state) => state.thread;

export default threadSlice.reducer;
