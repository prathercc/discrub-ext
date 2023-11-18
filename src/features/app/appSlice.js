import { createSlice } from "@reduxjs/toolkit";
import { wait } from "../../utils";

const defaultModify = {
  active: false, // Boolean for determining if a modify action is active
  entity: null, // Entity that is being modified
  statusText: null, // String text that can used for updating the User on modify action progress
};

export const appSlice = createSlice({
  name: "app",
  initialState: {
    discrubPaused: false, // Flag to pause Export/Purge/Search
    discrubCancelled: false, // Flag to cancel Export/Purge/Search
    modify: defaultModify, // Modify object, used for manipulating an entity
  },
  reducers: {
    setDiscrubPaused: (state, { payload }) => {
      state.discrubPaused = payload;
    },
    setDiscrubCancelled: (state, { payload }) => {
      state.discrubCancelled = payload;
    },
    setIsModifying: (state, { payload }) => {
      state.modify.active = payload;
    },
    setModifyEntity: (state, { payload }) => {
      state.modify.entity = payload;
    },
    setModifyStatusText: (state, { payload }) => {
      state.modify.statusText = payload;
    },
    resetModifyStatusText: (state, { payload }) => {
      state.modify.statusText = "";
    },
    resetModify: (state, { payload }) => {
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

export const checkDiscrubPaused = () => async (dispatch, getState) => {
  while (getState().app.discrubPaused) await wait(2);
};

export const getDiscrubCancelled = () => (dispatch, getState) => {
  return getState().app.discrubCancelled;
};

/**
 *
 * @param {String} message Message content
 * @param {Number} timeout Number of seconds before message times out
 * @returns
 */
export const setTimeoutMessage =
  (message = "", timeout = 1) =>
  async (dispatch, getState) => {
    dispatch(setModifyStatusText(message));
    return wait(timeout, () => dispatch(resetModifyStatusText()));
  };
export const selectApp = (state) => state.app;

export default appSlice.reducer;
