/*global chrome*/

import { DiscrubSetting } from "../enum/discrub-setting";
import { ResolutionType } from "../enum/resolution-type";
import { SortDirection } from "../enum/sort-direction";
import { AppSettings } from "../features/app/app-types";
import { UserDataRefreshRate } from "../enum/user-data-refresh-rate.ts";
import { DelayModifier } from "../enum/delay-modifier.ts";
import { Delay } from "../enum/delay.ts";
import { DateFormat } from "../enum/date-format.ts";
import { TimeFormat } from "../enum/time-format.ts";
import { BrowserEnvironment } from "../enum/browser-environment.ts";

type ChromeCallback = (param: string) => Promise<void> | void | Maybe;

export const sendChromeMessage = (msg: string, callback?: ChromeCallback) => {
  chrome &&
    chrome.tabs &&
    chrome.tabs.query(
      { active: true, currentWindow: true },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function (tabs: any) {
        if (callback) {
          chrome.tabs.sendMessage(tabs[0].id, { message: msg }, callback);
        } else {
          chrome.tabs.sendMessage(tabs[0].id, { message: msg });
        }
      },
    );
};

const defaultSettings = [
  // Extension Use Only
  { name: DiscrubSetting.BROWSER_ENV, value: BrowserEnvironment.CHROME },
  //

  { name: DiscrubSetting.REACTIONS_ENABLED, value: "true" },
  { name: DiscrubSetting.SERVER_NICKNAME_LOOKUP, value: "true" },
  { name: DiscrubSetting.DISPLAY_NAME_LOOKUP, value: "true" },
  { name: DiscrubSetting.SEARCH_DELAY, value: Delay.ONE },
  { name: DiscrubSetting.DELETE_DELAY, value: Delay.TWO },
  {
    name: DiscrubSetting.DELAY_MODIFIER,
    value: DelayModifier.ZERO_POINT_FIVE,
  },
  { name: DiscrubSetting.DATE_FORMAT, value: DateFormat.MMDDYYYY },
  { name: DiscrubSetting.TIME_FORMAT, value: TimeFormat._12HOUR },

  {
    name: DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS,
    value: "false",
  },
  { name: DiscrubSetting.EXPORT_ARTIST_MODE, value: "false" },
  {
    name: DiscrubSetting.EXPORT_MESSAGE_SORT_ORDER,
    value: SortDirection.DESCENDING,
  },
  { name: DiscrubSetting.EXPORT_PREVIEW_MEDIA, value: "" },
  { name: DiscrubSetting.EXPORT_DOWNLOAD_MEDIA, value: "" },
  { name: DiscrubSetting.EXPORT_MESSAGES_PER_PAGE, value: "1000" },
  {
    name: DiscrubSetting.EXPORT_IMAGE_RES_MODE,
    value: ResolutionType.HOVER_LIMITED,
  },

  { name: DiscrubSetting.PURGE_RETAIN_ATTACHED_MEDIA, value: "false" },
  { name: DiscrubSetting.PURGE_REACTION_REMOVAL_FROM, value: "" },

  { name: DiscrubSetting.APP_SHOW_KOFI_FEED, value: "true" },
  {
    name: DiscrubSetting.APP_USER_DATA_REFRESH_RATE,
    value: UserDataRefreshRate.DAILY,
  },

  { name: DiscrubSetting.CACHED_USER_MAP, value: "{}" },
  { name: DiscrubSetting.CACHED_ANNOUNCEMENT_REV, value: "1" },
];

export const initializeSettings = async () => {
  for (const setting of defaultSettings) {
    const foundSetting = await chrome.storage.local.get(setting.name);
    const isPurgeRemovalFrom =
      setting.name === DiscrubSetting.PURGE_REACTION_REMOVAL_FROM;
    const isNoSettingFound = !Object.keys(foundSetting).length;

    if (isNoSettingFound || isPurgeRemovalFrom) {
      await chrome.storage.local.set({ [setting.name]: setting.value });
    }
  }
  return getSettings();
};

export const getSettings = async (): Promise<AppSettings> => {
  const chromeSettings = await chrome.storage.local.get(
    defaultSettings.map((setting) => setting.name),
  );

  return {
    // Extension Use Only
    [DiscrubSetting.BROWSER_ENV]: chromeSettings[DiscrubSetting.BROWSER_ENV],
    //

    [DiscrubSetting.REACTIONS_ENABLED]:
      chromeSettings[DiscrubSetting.REACTIONS_ENABLED],
    [DiscrubSetting.SERVER_NICKNAME_LOOKUP]:
      chromeSettings[DiscrubSetting.SERVER_NICKNAME_LOOKUP],
    [DiscrubSetting.DISPLAY_NAME_LOOKUP]:
      chromeSettings[DiscrubSetting.DISPLAY_NAME_LOOKUP],
    [DiscrubSetting.SEARCH_DELAY]: chromeSettings[DiscrubSetting.SEARCH_DELAY],
    [DiscrubSetting.DELETE_DELAY]: chromeSettings[DiscrubSetting.DELETE_DELAY],
    [DiscrubSetting.DELAY_MODIFIER]:
      chromeSettings[DiscrubSetting.DELAY_MODIFIER],
    [DiscrubSetting.DATE_FORMAT]: chromeSettings[DiscrubSetting.DATE_FORMAT],
    [DiscrubSetting.TIME_FORMAT]: chromeSettings[DiscrubSetting.TIME_FORMAT],

    [DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS]:
      chromeSettings[DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS],
    [DiscrubSetting.EXPORT_ARTIST_MODE]:
      chromeSettings[DiscrubSetting.EXPORT_ARTIST_MODE],
    [DiscrubSetting.EXPORT_MESSAGE_SORT_ORDER]:
      chromeSettings[DiscrubSetting.EXPORT_MESSAGE_SORT_ORDER],
    [DiscrubSetting.EXPORT_PREVIEW_MEDIA]:
      chromeSettings[DiscrubSetting.EXPORT_PREVIEW_MEDIA],
    [DiscrubSetting.EXPORT_DOWNLOAD_MEDIA]:
      chromeSettings[DiscrubSetting.EXPORT_DOWNLOAD_MEDIA],
    [DiscrubSetting.EXPORT_MESSAGES_PER_PAGE]:
      chromeSettings[DiscrubSetting.EXPORT_MESSAGES_PER_PAGE],
    [DiscrubSetting.EXPORT_IMAGE_RES_MODE]:
      chromeSettings[DiscrubSetting.EXPORT_IMAGE_RES_MODE],

    [DiscrubSetting.PURGE_RETAIN_ATTACHED_MEDIA]:
      chromeSettings[DiscrubSetting.PURGE_RETAIN_ATTACHED_MEDIA],
    [DiscrubSetting.PURGE_REACTION_REMOVAL_FROM]:
      chromeSettings[DiscrubSetting.PURGE_REACTION_REMOVAL_FROM],

    [DiscrubSetting.APP_SHOW_KOFI_FEED]:
      chromeSettings[DiscrubSetting.APP_SHOW_KOFI_FEED],
    [DiscrubSetting.APP_USER_DATA_REFRESH_RATE]:
      chromeSettings[DiscrubSetting.APP_USER_DATA_REFRESH_RATE],

    [DiscrubSetting.CACHED_USER_MAP]:
      chromeSettings[DiscrubSetting.CACHED_USER_MAP],
    [DiscrubSetting.CACHED_ANNOUNCEMENT_REV]:
      chromeSettings[DiscrubSetting.CACHED_ANNOUNCEMENT_REV],
  };
};

export const setSetting = async (name: string, value: string) => {
  await chrome.storage.local.set({ [name]: value });
  return getSettings();
};
