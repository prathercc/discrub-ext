import { createSlice } from "@reduxjs/toolkit";
import { wait } from "../../utils";
import {
  AppTask,
  AppState,
  Timeout,
  AppSettings,
  AppTaskEntity,
} from "./app-types";
import { AppThunk } from "../../app/store";
import { DiscrubSetting } from "../../enum/discrub-setting";
import { SortDirection } from "../../enum/sort-direction";
import { ResolutionType } from "../../enum/resolution-type";
import { UserDataRefreshRate } from "../../enum/user-data-refresh-rate.ts";
import { setSetting } from "../../services/chrome-service.ts";
import { DelayModifier } from "../../enum/delay-modifier.ts";
import { Delay } from "../../enum/delay.ts";
import { DateFormat } from "../../enum/date-format.ts";
import { TimeFormat } from "../../enum/time-format.ts";
import { BrowserEnvironment } from "../../enum/browser-environment.ts";

export const defaultSettings: AppSettings = {
  // Extension Use Only
  [DiscrubSetting.BROWSER_ENV]: BrowserEnvironment.FIREFOX,
  //

  [DiscrubSetting.REACTIONS_ENABLED]: "false",
  [DiscrubSetting.SERVER_NICKNAME_LOOKUP]: "false",
  [DiscrubSetting.DISPLAY_NAME_LOOKUP]: "false",
  [DiscrubSetting.SEARCH_DELAY]: Delay.ONE,
  [DiscrubSetting.DELETE_DELAY]: Delay.TWO,
  [DiscrubSetting.DELAY_MODIFIER]: DelayModifier.ZERO_POINT_FIVE,
  [DiscrubSetting.DATE_FORMAT]: DateFormat.MMDDYYYY,
  [DiscrubSetting.TIME_FORMAT]: TimeFormat._12HOUR,

  [DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS]: "true",
  [DiscrubSetting.EXPORT_ARTIST_MODE]: "true",
  [DiscrubSetting.EXPORT_MESSAGE_SORT_ORDER]: SortDirection.DESCENDING,
  [DiscrubSetting.EXPORT_PREVIEW_MEDIA]: "",
  [DiscrubSetting.EXPORT_DOWNLOAD_MEDIA]: "",
  [DiscrubSetting.EXPORT_MESSAGES_PER_PAGE]: "1000",
  [DiscrubSetting.EXPORT_IMAGE_RES_MODE]: ResolutionType.HOVER_LIMITED,

  [DiscrubSetting.PURGE_RETAIN_ATTACHED_MEDIA]: "false",
  [DiscrubSetting.PURGE_REACTION_REMOVAL_FROM]: "",

  [DiscrubSetting.APP_SHOW_KOFI_FEED]: "true",
  [DiscrubSetting.APP_USER_DATA_REFRESH_RATE]: UserDataRefreshRate.DAILY,

  [DiscrubSetting.CACHED_USER_MAP]: "{}",
  [DiscrubSetting.CACHED_ANNOUNCEMENT_REV]: "1",
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
    setModifyEntity: (state, { payload }: { payload: AppTaskEntity }): void => {
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

/**
 * Reset the value of setting: PURGE_REACTION_REMOVAL_FROM
 */
export const resetPurgeRemovalFrom =
  (): AppThunk<Promise<void>> => async (dispatch) => {
    const settings = await setSetting(
      DiscrubSetting.PURGE_REACTION_REMOVAL_FROM,
      "",
    );
    dispatch(setSettings(settings));
  };

export default appSlice.reducer;
