/*global chrome*/

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

const defaultSettings = [{ name: "fetchReactionData", value: 1 }];

export const initializeSettings = async () => {
  for (const setting of defaultSettings) {
    const foundSetting = await chrome.storage.local.get(setting.name);
    if (!Object.keys(foundSetting).length) {
      await chrome.storage.local.set({ [setting.name]: setting.value });
    }
  }
};

export const getSettings = async () => {
  return chrome.storage.local.get(
    defaultSettings.map((setting) => setting.name)
  );
};

export const setSetting = async (name: string, value: string | number) => {
  await chrome.storage.local.set({ [name]: value });
};

export const getReactionsEnabled = async () => {
  const settings = await getSettings();
  return settings.fetchReactionData === 1;
};
