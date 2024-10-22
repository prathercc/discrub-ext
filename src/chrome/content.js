export const passMessage = (request, callback) => {
  browser.runtime.sendMessage(request).then((response) => {
    callback?.(response);
  });
};

if (!browser.runtime.onMessage.hasListeners?.())
  browser.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (!document.URL.includes("moz-extension")) {
      const { message } = request;
      switch (message) {
        case "INJECT_BUTTON":
          // eslint-disable-next-line no-case-declarations
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
            iframe.src = browser.runtime.getURL("button_injection.html");
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
            modal.style.padding = 0;
            modal.style.border = "none";
            modal.style.backgroundColor = "transparent";
            modal.style.overflow = "auto";
            const iframe = document.createElement("iframe");
            iframe.id = "injected_dialog_iframe";
            iframe.src = browser.runtime.getURL("index.html");
            iframe.height = "675px";
            iframe.width = "1250px";
            // iframe.style.border = "1px dotted gray";
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
          // eslint-disable-next-line no-case-declarations
          const storage = document.body.appendChild(
            document.createElement("iframe")
          ).contentWindow.localStorage;
          if (storage.token) sendResponse(JSON.parse(storage.token));
          else sendResponse(null);
        default:
          break;
      }
    }
  });
