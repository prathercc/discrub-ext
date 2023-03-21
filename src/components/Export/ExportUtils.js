import { useReactToPrint } from "react-to-print";
import streamSaver from "streamsaver";
import { Writer } from "@transcend-io/conflux";
export default class ExportUtils {
  constructor(contentRef, callback, zipName) {
    this.contentRef = contentRef;
    this.callback = callback;
    const { readable, writable } = new Writer();
    this.readable = readable;
    this.writable = writable;
    this.writer = this.writable.getWriter();
    this.zipName = zipName;
    streamSaver.mitm = "mitm.html";
    this.fileStream = null;
    );
  }
  _delay(ms) {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, ms)
    );
  }

  generateHTML = async () => {
    this.html = null;
    this.callback(true);
    this._generateHTMLHelperFunc();
    while (!this.html) await this._delay(2000);
    this.callback(false);
    return new Blob([this.html], { type: "text/html" });
  };

  _generateHTMLHelperFunc = useReactToPrint({
    content: () => this.contentRef.current,
    suppressErrors: true,
    print: (iframe) => {
      const bodyElementStyle =
        iframe.contentWindow.document.lastElementChild.getElementsByTagName(
          "body"
        )[0].style;
      bodyElementStyle.margin = "3px";
      bodyElementStyle.backgroundColor = "#36393f";

      let meta = document.createElement("meta");
      meta.httpEquiv = "Content-Type";
      meta.content = "text/html; charset=utf-8";
      iframe.contentWindow.document
        .getElementsByTagName("head")[0]
        .prepend(meta);

      this.html = iframe.contentWindow.document.lastElementChild.outerHTML;
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
