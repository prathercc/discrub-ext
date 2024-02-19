import { createSlice } from "@reduxjs/toolkit";
import { wait } from "../../utils";
import { AppTask, AppState, Timeout } from "./app-types";
import Message from "../../classes/message";
import { AppThunk } from "../../app/store";

const emptyTask: AppTask = {
  active: false,
  entity: null,
  statusText: null,
};

const initialState: AppState = {
  discrubPaused: false, // Flag to pause Export/Purge/Search
  discrubCancelled: false, // Flag to cancel Export/Purge/Search
  task: emptyTask, // AppTask object, used for manipulating an entity
};

export const appSlice = createSlice({
  name: "app",
  initialState: initialState,
  reducers: {
    setDiscrubPaused: (state, { payload }: { payload: boolean }): void => {
      state.discrubPaused = payload;
    },
    setDiscrubCancelled: (state, { payload }: { payload: boolean }): void => {
      state.discrubCancelled = payload;
    },
    setIsModifying: (state, { payload }: { payload: boolean }): void => {
      state.task.active = payload;
    },
    setModifyEntity: (
      state,
      { payload }: { payload: Message | Maybe }
    ): void => {
      state.task.entity = payload;
    },
    setStatus: (state, { payload }: { payload: string | Maybe }): void => {
      state.task.statusText = payload;
    },
    resetStatus: (state): void => {
      state.task.statusText = "";
    },
    resetModify: (state): void => {
      state.task = emptyTask;
    },
  },
});

export const {
  setDiscrubPaused,
  setDiscrubCancelled,
  setIsModifying,
  setModifyEntity,
  setStatus,
  resetStatus,
  resetModify,
} = appSlice.actions;

export const checkDiscrubPaused =
  (): AppThunk<Promise<void>> => async (_, getState) => {
    while (getState().app.discrubPaused) await wait(2);
  };

/**
 * Used for temporary status updates regarding the task object
 */
export const setTimeoutMessage =
  ({ message, timeout }: Timeout): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(setStatus(message));
    await wait(timeout, () => dispatch(resetStatus()));
  };

export default appSlice.reducer;
