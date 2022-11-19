import { useReactToPrint } from "react-to-print";

export default class ExportUtils {
  constructor(contentRef, callback, lastElementId) {
    this.contentRef = contentRef;
    this.callback = callback;
    this.lastElementId = lastElementId;
  }
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
    const delay = () => {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve();
        }, 1000)
      );
    };
    // Attempt for an hour max
    while (!lastElement && attempts < 720) {
      await delay();
      attempts += 1;
      lastElement = document.getElementById(this.lastElementId);
    }
    return !!lastElement;
  };
}
