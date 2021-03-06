/*global chrome*/
chrome.runtime.onMessage.addListener(function (request, sender, callback) {
  const { message } = request;
  switch (message) {
    case "INJECT_BUTTON":
      const element =
        document.querySelector('[aria-label="Channel header"]') ||
        document.querySelector('[aria-label="Friends"]')?.parentElement
          ?.parentElement;
      if (!document.getElementById("injected_iframe_button") && element) {
        const iframe = document.createElement("iframe");
        iframe.id = "injected_iframe_button";
        iframe.src = chrome.runtime.getURL("injected_button.html");
        iframe.scrolling = "no";
        iframe.width = 90;
        iframe.height = 30;
        element.appendChild(iframe);
      }
      break;
    case "INJECT_DIALOG":
      if (!document.getElementById("injected_dialog")) {
        const modal = document.createElement("dialog");
        modal.id = "injected_dialog";
        modal.style.padding = 0;
        modal.style.border = "none";
        modal.style.backgroundColor = "transparent";
        const iframe = document.createElement("iframe");
        iframe.id = "injected_dialog_iframe";
        iframe.src = chrome.runtime.getURL("injected_dialog.html");
        iframe.height = "702px";
        iframe.width = "777px";
        modal.appendChild(iframe);
        document.body.appendChild(modal);
        document.getElementById("injected_dialog").showModal();
      }
      break;
    case "CLOSE_INJECTED_DIALOG":
      if (document.getElementById("injected_dialog")) {
        document.getElementById("injected_dialog_iframe").remove();
        document.getElementById("injected_dialog").remove();
      }
      break;
    case "GET_TOKEN":
      window.dispatchEvent(new Event("beforeunload"));
      const storage = document.body.appendChild(
        document.createElement("iframe")
      ).contentWindow.localStorage;
      if (storage.token) callback(JSON.parse(storage.token));
      return true;
    default:
      break;
  }
});
