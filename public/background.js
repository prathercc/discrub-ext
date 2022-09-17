/*global chrome*/
chrome.action.onClicked.addListener((tab) => {
  if (chrome && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { message: "INJECT_DIALOG" },
          () => {}
        );
      }
    });
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (chrome && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { message: "INJECT_BUTTON" },
          () => {}
        );
      }
    });
  }
});
