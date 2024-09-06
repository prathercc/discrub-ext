/*global chrome*/

import { DiscrubSetting } from "../enum/discrub-setting";
import { ResolutionType } from "../enum/resolution-type";
import { SortDirection } from "../enum/sort-direction";
import { AppSettings } from "../features/app/app-types";

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
      }
    );
};

const defaultSettings = [
  { name: DiscrubSetting.REACTIONS_ENABLED, value: "true" },
  { name: DiscrubSetting.SERVER_NICKNAME_LOOKUP, value: "true" },
  { name: DiscrubSetting.DISPLAY_NAME_LOOKUP, value: "true" },

  {
    name: DiscrubSetting.EXPORT_SEPARATE_THREAD_AND_FORUM_POSTS,
    value: "false",
  },
  { name: DiscrubSetting.EXPORT_ARTIST_MODE, value: "false" },
  {
    name: DiscrubSetting.EXPORT_MESSAGE_SORT_ORDER,
    value: SortDirection.DESCENDING,
  },
  { name: DiscrubSetting.EXPORT_PREVIEW_MEDIA, value: "false" },
  { name: DiscrubSetting.EXPORT_DOWNLOAD_MEDIA, value: "false" },
  { name: DiscrubSetting.EXPORT_MESSAGES_PER_PAGE, value: "1000" },
  {
    name: DiscrubSetting.EXPORT_IMAGE_RES_MODE,
    value: ResolutionType.HOVER_LIMITED,
  },
];

export const initializeSettings = async () => {
  for (const setting of defaultSettings) {
    const foundSetting = await chrome.storage.local.get(setting.name);
    if (!Object.keys(foundSetting).length) {
      await chrome.storage.local.set({ [setting.name]: setting.value });
    }
  }
  return getSettings();
};

export const getSettings = async (): Promise<AppSettings> => {
  const chromeSettings = await chrome.storage.local.get(
    defaultSettings.map((setting) => setting.name)
  );

  return {
    [DiscrubSetting.REACTIONS_ENABLED]:
      chromeSettings[DiscrubSetting.REACTIONS_ENABLED],
    [DiscrubSetting.SERVER_NICKNAME_LOOKUP]:
      chromeSettings[DiscrubSetting.SERVER_NICKNAME_LOOKUP],
    [DiscrubSetting.DISPLAY_NAME_LOOKUP]:
      chromeSettings[DiscrubSetting.DISPLAY_NAME_LOOKUP],

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
  };
};

export const setSetting = async (name: string, value: string) => {
  await chrome.storage.local.set({ [name]: value });
  return getSettings();
};
