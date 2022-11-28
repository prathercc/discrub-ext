import { useReactToPrint } from "react-to-print";
import JSZip from "jszip";
import { v4 as uuidv4 } from "uuid";
export default class ExportUtils {
  constructor(contentRef, callback, lastElementId) {
    this.contentRef = contentRef;
    this.callback = callback;
    this.lastElementId = lastElementId;
    this.zip = new JSZip();
  }
  _delay(ms) {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve();
      }, ms)
    );
  }

  createZipFolder = (folderName) => {
    return this.zip.folder(folderName.replace(/\W/g, ""));
  };

  addToFolder = (folder, data, filename) => {
    const cleanFileName = filename.replace(/[^\w.]+/g, "");
    if (cleanFileName.length > 0 && cleanFileName.includes(".")) {
      const splitArr = cleanFileName.split(".");
      folder.file(
        `${cleanFileName.replace(
          splitArr[splitArr.length - 1],
          ""
        )}${uuidv4()}.${splitArr[splitArr.length - 1]}`,
        data
      );
      return cleanFileName;
    }
    return { size: 0 };
  };

  addToZip = (blob, filename) => {
    this.zip.file(`${filename.replace(/\W/g, "")}.${uuidv4()}.json`, blob);
  };

  generateZip = async () => {
    await this.zip.generateAsync({ type: "blob" }).then(function (content) {
      let link = document.createElement("a");
      link.download = `Guild Export.${uuidv4()}.zip`;
      link.href = window.URL.createObjectURL(content);
      link.click();
    });
  };

  resetZip = () => {
    this.zip = new JSZip();
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
}
