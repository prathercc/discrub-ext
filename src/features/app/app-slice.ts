import { createSlice } from "@reduxjs/toolkit";
import { wait } from "../../utils";
import { AppTask, AppState, Timeout, AppSettings } from "./app-types";
import Message from "../../classes/message";
import { AppThunk } from "../../app/store";
import { DiscrubSetting } from "../../enum/discrub-setting";
import { SortDirection } from "../../enum/sort-direction";
import { ResolutionType } from "../../enum/resolution-type";
import { UserDataRefreshRate } from "../../enum/user-data-refresh-rate.ts";

const defaultSettings: AppSettings = {
  [DiscrubSetting.REACTIONS_ENABLED]: "false",
  [DiscrubSetting.SERVER_NICKNAME_LOOKUP]: "false",
  [DiscrubSetting.DISPLAY_NAME_LOOKUP]: "false",
  [DiscrubSetting.RANDOM_DELETE_DELAY]: "0",
  [DiscrubSetting.RANDOM_SEARCH_DELAY]: "0",

  [DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS]: "false",
  [DiscrubSetting.EXPORT_ARTIST_MODE]: "false",
  [DiscrubSetting.EXPORT_MESSAGE_SORT_ORDER]: SortDirection.DESCENDING,
  [DiscrubSetting.EXPORT_PREVIEW_MEDIA]: "",
  [DiscrubSetting.EXPORT_DOWNLOAD_MEDIA]: "",
  [DiscrubSetting.EXPORT_MESSAGES_PER_PAGE]: "1000",
  [DiscrubSetting.EXPORT_IMAGE_RES_MODE]: ResolutionType.HOVER_LIMITED,

  [DiscrubSetting.APP_SHOW_KOFI_FEED]: "true",
  [DiscrubSetting.APP_USER_DATA_REFRESH_RATE]: UserDataRefreshRate.DAILY,

  [DiscrubSetting.CACHED_USER_MAP]: "{}",
};

const emptyTask: AppTask = {
  active: false,
  entity: null,
  statusText: null,
};

const initialState: AppState = {
  discrubPaused: false, // Flag to pause Export/Purge/Search
  discrubCancelled: false, // Flag to cancel Export/Purge/Search
  task: emptyTask, // AppTask object, used for manipulating an entity
  settings: defaultSettings,
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
      { payload }: { payload: Message | Maybe },
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
    setSettings: (state, { payload }: { payload: AppSettings }): void => {
      state.settings = payload;
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
  setSettings,
} = appSlice.actions;

export const isAppStopped =
  (): AppThunk<Promise<boolean>> => async (_, getState) => {
    if (getState().app.discrubCancelled) return true;
    while (getState().app.discrubPaused) await wait(2);
    return getState().app.discrubCancelled;
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
