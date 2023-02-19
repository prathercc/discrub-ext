/*global chrome*/
if (!chrome.runtime.onMessage.hasListeners())
  chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    const { message } = request;
    switch (message) {
      case "INJECT_BUTTON":
        const element =
          document.querySelector('[aria-label="Inbox"]')?.parentElement ||
          document.querySelector('[aria-label="Help"]')?.parentElement;
        if (!document.getElementById("injected_iframe_button") && element) {
          element.style.display = "flex";
          element.style.flexDirection = "row-reverse";
          element.style.alignItems = "center";
          element.style.justifyContent = "center";
          const iframe = document.createElement("iframe");
          iframe.id = "injected_iframe_button";
          iframe.src = chrome.runtime.getURL("injected_button.html");
          iframe.scrolling = "no";
          iframe.width = 30;
          iframe.height = 30;
          element.appendChild(iframe);
        }
        break;
      case "INJECT_DIALOG":
        if (!document.getElementById("injected_dialog")) {
          const modal = document.createElement("dialog");
          modal.id = "injected_dialog";
          modal.innerHTML =
            "<style>::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:#f1f1f1;}::-webkit-scrollbar-track{background:#888;}</style>";
          modal.style.boxShadow = "17px 18px 5px -9px rgba(0,0,0,0.41)";
          modal.style.padding = 0;
          modal.style.border = "none";
          modal.style.backgroundColor = "transparent";
          modal.style.overflow = "auto";
          const iframe = document.createElement("iframe");
          iframe.id = "injected_dialog_iframe";
          iframe.src = chrome.runtime.getURL("injected_dialog.html");
          iframe.height = "662px";
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
