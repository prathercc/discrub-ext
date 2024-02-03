import { useReactToPrint } from "react-to-print";
import streamSaver from "streamsaver";
import { Writer } from "@transcend-io/conflux";
import { wait } from "../../utils";

export default class ExportUtils {
  constructor(contentRef, callback, zipName) {
    this.contentRef = contentRef;
    this.callback = callback;
    const { readable, writable } = new Writer();
    this.readable = readable;
    this.writable = writable;
    this.writer = this.writable.getWriter();
    this.zipName = zipName;
    streamSaver.mitm = "resources/html/mitm.html";
    this.fileStream = null;
    this.exportMessages = [];
    this.unknownError = {
      message: "Page HTML could not be found.",
      stack: "No error given, please try exporting this page again.",
    };
  }

  setExportMessages = (val) => {
    this.exportMessages = val;
  };

  generateHTML = async () => {
    this.html = null;
    this.callback(true);
    // Wait for contentRef to obtain value
    while (!this.contentRef.current) await wait(1);
    this._generateHTMLHelperFunc();
    // Wait for html to be generated
    while (!this.html) await wait(1);
    this.callback(false);
    return new Blob([this.html], { type: "text/html" });
  };

  _getErrorHtml = (e) => {
    return `<h2>Export error</h2><strong>Please save and send this page to <a href='https://www.reddit.com/user/prathercc/'>u/prathercc</a> for support.</strong> <div><strong>Official support page - <a href='https://www.reddit.com/r/discrub/'>https://www.reddit.com/r/discrub/</a></strong></div><div>${
      e.message
    }</div><div>${
      e.stack
    }</div><div style="background-color:black;color:white;border-radius:5px;margin-top:10px;">${this.exportMessages?.map(
      (msg) => `<div>${JSON.stringify(msg)}</div>`
    )}</div>`;
  };

  _generateHTMLHelperFunc = useReactToPrint({
    content: () => this.contentRef.current,
    suppressErrors: true,
    print: (iframe) => {
      try {
        const bodyElementStyle =
          iframe.contentWindow.document.lastElementChild.getElementsByTagName(
            "body"
          )[0].style;
        bodyElementStyle.margin = "3px";
        bodyElementStyle.backgroundColor = "#313338";

        let meta = document.createElement("meta");
        meta.httpEquiv = "Content-Type";
        meta.content = "text/html; charset=utf-8";
        iframe.contentWindow.document
          .getElementsByTagName("head")[0]
          .prepend(meta);
        const printedHtml =
          iframe.contentWindow.document.lastElementChild.outerHTML;

        if (!printedHtml) {
          this.html = this._getErrorHtml(this.unknownError);
          return new Promise(() => {
            console.warn("Issue exporting page", this.unknownError);
          });
        }
        this.html = printedHtml;
        return new Promise(() => {
          console.warn("Page exported successfully");
        });
      } catch (e) {
        return new Promise(() => {
          console.error("Issue exporting page - ", e);
          this.html = this._getErrorHtml(e);
        });
      }
    },
    removeAfterPrint: true,
  });

  addToZip = async (blob, filename) => {
    if (!this.fileStream) {
      this.fileStream = streamSaver.createWriteStream(
        `${this.zipName || "Export"}.zip`
      );
    }
    try {
      await this.writer.ready;
      this.writer.write({
        name: `${filename}`,
        lastModified: new Date(),
        stream: () => new Response(blob).body,
      });
      if (!this.readable.locked) {
        this.readable.pipeTo(this.fileStream);
      }
    } catch (e) {
      console.error("Error adding to zip", e);
      await this.resetZip();
    }
  };

  generateZip = async () => {
    try {
      await this.writer.ready;
      await this.writer.close();
    } catch (e) {
      console.error("Error generating archive", e);
    }
  };

  resetZip = async () => {
    try {
      await this.writer.ready;
      await this.writer.close();
    } catch {
      console.warn("Redundant close request sent to archive writer.");
    } finally {
      const { readable, writable } = new Writer();
      this.readable = readable;
      this.writable = writable;
      this.writer = this.writable.getWriter();
      this.fileStream = null;
    }
  };
}
