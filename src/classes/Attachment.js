import { v4 as uuidv4 } from "uuid";

class Attachment {
  constructor(json) {
    const { content_type, filename, height, id, proxy_url, size, url, width } =
      json;
    this.content_type = content_type;
    this.filename = filename;
    this.height = height;
    this.id = id;
    this.proxy_url = proxy_url;
    this.size = size;
    this.url = url;
    this.width = width;
  }

  isImage() {
    return (
      this.content_type?.includes("image") ||
      ["png", "jpg", "jpeg", "gif"].some((sit) => this.filename.includes(sit))
    );
  }

  isVideo() {
    return this.content_type?.includes("video");
  }

  isMedia() {
    return this.isImage() || this.isVideo();
  }

  getMediaUrl() {
    return this.proxy_url;
  }

  getNonMediaUrl() {
    return this.url;
  }

  getMediaDownloadUrls() {
    return [this.getMediaUrl()].filter(Boolean);
  }

  getExportFileName(type) {
    return `${this.filename}_${uuidv4()}.${type}`;
  }
}
export default Attachment;
