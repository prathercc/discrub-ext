/* eslint-disable no-undef */
import * as module from "./sw.js";

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (browser && browser.tabs) {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs) {
        browser.tabs.sendMessage(tabs[0].id, request).then((response) => {
          sendResponse(response);
        });
      }
    });
  }
  return true;
});

browser.action.onClicked.addListener((tab) => {
  if (browser && browser.tabs) {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { message: "INJECT_DIALOG" });
      }
    });
  }
});

browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (browser && browser.tabs) {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { message: "INJECT_BUTTON" });
      }
    });
  }
});
