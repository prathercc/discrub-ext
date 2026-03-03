/* eslint-disable no-undef */
/*global chrome browser*/
import * as module from "./sw.js";

const ext = typeof browser !== "undefined" ? browser : chrome;

const queryActiveTabs = (callback) => {
  try {
    const result = ext.tabs.query({ active: true, currentWindow: true });
    if (result && typeof result.then === "function") {
      result.then((tabs) => callback(tabs || [])).catch(() => callback([]));
      return;
    }
  } catch (_err) {
    // Fall back to callback API below.
  }

  try {
    ext.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      callback(tabs || []);
    });
  } catch (_err) {
    callback([]);
  }
};

const sendToActiveTab = (request, callback) => {
  if (!(ext && ext.tabs)) {
    callback?.(null);
    return;
  }

  queryActiveTabs((tabs) => {
    const activeTab = tabs?.[0];
    if (!activeTab?.id) {
      callback?.(null);
      return;
    }

    if (callback) {
      try {
        const result = ext.tabs.sendMessage(activeTab.id, request);
        if (result && typeof result.then === "function") {
          result.then((response) => callback(response)).catch(() => callback(null));
          return;
        }
      } catch (_err) {
        // Fall back to callback API below.
      }

      try {
        ext.tabs.sendMessage(activeTab.id, request, callback);
      } catch (_err) {
        callback(null);
      }
    } else {
      try {
        ext.tabs.sendMessage(activeTab.id, request, () => {});
      } catch (_err) {
        // Ignore send failures on tabs where content scripts are unavailable.
      }
    }
  });
};

if (ext?.runtime?.onMessage?.addListener) {
  ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendToActiveTab(request, sendResponse);
    return true;
  });
}

ext.action.onClicked.addListener(() => {
  sendToActiveTab({ message: "INJECT_DIALOG" });
});

ext.tabs.onUpdated.addListener(() => {
  sendToActiveTab({ message: "INJECT_BUTTON" });
});
