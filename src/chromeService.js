/*global chrome*/

export const sendChromeMessage = (msg, setResponseObject) => {
  chrome &&
    chrome.tabs &&
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: msg }, setResponseObject);
    });
};
