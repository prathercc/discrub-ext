import { useReactToPrint } from "react-to-print";
import { fetchMessageData, fetchThreads } from "../../discordService";
import JSZip from "jszip";

export default class ExportUtils {
  constructor(contentRef, callback, lastElementId, token) {
    this.contentRef = contentRef;
    this.callback = callback;
    this.lastElementId = lastElementId;
    this.token = token;
  }
  _delay(ms) {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, ms)
    );
  }

  downloadSelectedJSON = async (selectedChannels) => {
    const zip = new JSZip();
    let count = 0;
    while (count < selectedChannels.length) {
      this.contentRef.current = selectedChannels[count].id;
      this.callback({
        active: true,
        name: selectedChannels[count].name,
      });
      const messages = await this._getMessageData(this.contentRef, this.token);
      zip.file(
        `${selectedChannels[count].name.replace(/\W/g, "")}.json`,
        new Blob([JSON.stringify(messages)], { type: "text/plain" })
      );
      count += 1;
    }
    await zip.generateAsync({ type: "blob" }).then(function (content) {
      let link = document.createElement("a");
      link.download = "Guild Export.zip";
      link.href = window.URL.createObjectURL(content);
      link.click();
    });
    this.callback({ active: false, name: null });
  };
  downloadJSON = (exportMessages) => {
    let json_string = JSON.stringify(exportMessages);
    let link = document.createElement("a");
    link.download = "Exported Messages.json";
    let blob = new Blob([json_string], { type: "text/plain" });
    link.href = window.URL.createObjectURL(blob);
    link.click();
    this.callback();
  };
  downloadPDF = useReactToPrint({
    content: () => this.contentRef.current,
    onAfterPrint: () => this.callback(),
    removeAfterPrint: true,
  });
  downloadHTML = useReactToPrint({
    content: () => this.contentRef.current,
    print: (iframe) => {
      iframe.contentWindow.document.lastElementChild.getElementsByTagName(
        "body"
      )[0].margin = 0;
      const html = iframe.contentWindow.document.lastElementChild.outerHTML;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      a.download = "Exported Messages.html";
      a.hidden = true;
      document.body.appendChild(a);
      a.click();
      this.callback();
    },
    removeAfterPrint: true,
  });

  loadAllContent = async () => {
    let lastElement = null;
    let attempts = 0;
    // Attempt for an hour max
    while (!lastElement && attempts < 720) {
      await this._delay(1000);
      attempts += 1;
      lastElement = document.getElementById(this.lastElementId);
    }
    return !!lastElement;
  };

  async _getMessages(channelIdRef, token, retArr, thread = false) {
    const originalChannelId = channelIdRef?.current?.slice();
    const trackedThreads = []; // The thread ids that we found while parsing messages
    try {
      let lastId = "";
      let reachedEnd = false;
      let threadedData = [];
      while (!reachedEnd) {
        if (channelIdRef.current !== originalChannelId) break;
        const data = await fetchMessageData(token, lastId, originalChannelId);
        if (data.message && data.message.includes("Missing Access")) break;
        if (data.length < 100) reachedEnd = true;
        if (data.length > 0) lastId = data[data.length - 1].id;
        if (data && (data[0]?.content || data[0]?.attachments)) {
          for (const m of data) {
            if (m.type !== 21) {
              if (m.thread) {
                channelIdRef.current = m.thread?.id?.slice();
                trackedThreads.push({
                  id: m.thread?.id?.slice(),
                  name: m.thread?.name.slice(),
                  archived: m.thread?.thread_metadata?.archived,
                }); // Found a thread
                const foundMessages = await this._getMessages(
                  channelIdRef,
                  token,
                  retArr,
                  true
                );
                threadedData = threadedData.concat(
                  [m].concat(
                    foundMessages.sort((a, b) => a.position - b.position)
                  )
                );
                channelIdRef.current = originalChannelId?.slice();
              } else threadedData.push(m);
            }
          }

          if (!thread) {
            retArr = retArr.concat(threadedData);
            threadedData = [];
          }
        }
      }
      //Final check for unfounded threads
      let retThreads = [...trackedThreads];
      if (!thread) {
        let unfoundedThreads = await fetchThreads(token, originalChannelId);
        unfoundedThreads = unfoundedThreads
          .filter((ft) => !trackedThreads.find((tt) => ft.id === tt.id))
          .map((x) => ({ id: x.id, name: x.name, archived: true }));
        retThreads = retThreads.concat(unfoundedThreads);
        for (const ut of unfoundedThreads) {
          channelIdRef.current = ut?.id?.slice();
          const data = await this._getMessages(
            channelIdRef,
            token,
            retArr,
            true
          );
          retArr = retArr.concat(data);
          channelIdRef.current = originalChannelId?.slice();
        }
      }

      return thread ? threadedData : { retArr, retThreads };
    } catch (e) {
      console.error("Error fetching channel messages", e);
    }
  }

  async _getMessageData(channelIdRef, token) {
    const parseAts = (messageContent, uniqueRecipients) => {
      for (let [key, value] of uniqueRecipients.entries()) {
        messageContent = messageContent.replace(`<@${key}>`, `@${value}`);
        messageContent = messageContent.replace(`<@!${key}>`, `@${value}`);
      }
      return messageContent;
    };

    let retArr = [];

    let tempArr = [];
    ({ retArr } = await this._getMessages(channelIdRef, token, tempArr, false));
    let uniqueRecipients = new Map();
    await retArr.forEach((x) => {
      uniqueRecipients.set(x.author.id, x.author.username);
    });
    return retArr.map((message) => {
      return {
        ...message,
        username: message.author.username,
        content: parseAts(message.content, uniqueRecipients),
      };
    });
  }
}
