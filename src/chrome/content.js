/*global chrome browser*/
const ext = typeof browser !== "undefined" ? browser : chrome;
const hasListeners = ext?.runtime?.onMessage?.hasListeners;
const hasMessageListener =
  typeof hasListeners === "function"
    ? hasListeners.call(ext.runtime.onMessage)
    : false;

if (ext?.runtime?.onMessage && !hasMessageListener)
  ext.runtime.onMessage.addListener(function (request, sender, callback) {
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
          iframe.src = ext.runtime.getURL("button_injection.html");
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
          iframe.src = ext.runtime.getURL("index.html");
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
        if (storage.token) callback(JSON.parse(storage.token));
        else callback(null);
        return true;
      case "GET_CURRENT_VIEW":
        // Example path formats:
        // /channels/@me/<channel-id>
        // /channels/<guild-id>/<channel-or-thread-id>
        // eslint-disable-next-line no-case-declarations
        const match = window.location.pathname.match(
          /^\/channels\/([^/]+)\/([^/?#]+)/
        );
        if (match) {
          const guildId = match[1] === "@me" ? null : match[1];
          callback({ guildId, channelId: match[2] });
        } else {
          callback({ guildId: null, channelId: null });
        }
        return true;
      default:
        break;
    }
  });
