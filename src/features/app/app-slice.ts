import { createSlice } from "@reduxjs/toolkit";
import { wait } from "../../utils";
import { Modify, AppState, Timeout } from "./app-types";
import Message from "../../classes/message";
import { AppThunk } from "../../app/store";

const defaultModify: Modify = {
  active: false, // Boolean for determining if a modify action is active
  entity: null, // Entity that is being modified
  statusText: null, // String text that can used for updating the User on modify action progress
};

const initialState: AppState = {
  discrubPaused: false, // Flag to pause Export/Purge/Search
  discrubCancelled: false, // Flag to cancel Export/Purge/Search
  modify: defaultModify, // Modify object, used for manipulating an entity
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
      state.modify.active = payload;
    },
    setModifyEntity: (
      state,
      { payload }: { payload: Message | Maybe }
    ): void => {
      state.modify.entity = payload;
    },
    setModifyStatusText: (
      state,
      { payload }: { payload: string | Maybe }
    ): void => {
      state.modify.statusText = payload;
    },
    resetModifyStatusText: (state): void => {
      state.modify.statusText = "";
    },
    resetModify: (state): void => {
      state.modify = defaultModify;
    },
  },
});

export const {
  setDiscrubPaused,
  setDiscrubCancelled,
  setIsModifying,
  setModifyEntity,
  setModifyStatusText,
  resetModifyStatusText,
  resetModify,
} = appSlice.actions;

export const checkDiscrubPaused =
  (): AppThunk<Promise<void>> => async (_, getState) => {
    while (getState().app.discrubPaused) await wait(2);
  };

export const setTimeoutMessage =
  ({ message, timeout }: Timeout): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(setModifyStatusText(message));
    await wait(timeout, () => dispatch(resetModifyStatusText()));
  };

export default appSlice.reducer;
