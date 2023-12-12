/* eslint-disable no-unused-vars */
import { v4 as uuidv4 } from "uuid";
import { colorToHex } from "../utils";
class Embed {
  constructor(json) {
    const {
      type,
      description,
      color,
      fields,
      author,
      thumbnail,
      footer,
      image,
      timestamp,
      title,
      url,
      video,
    } = json;
    Object.assign(this, json);
  }

  getColor() {
    return colorToHex(this.color);
  }

  getAuthorIconUrl() {
    return this.author?.proxy_icon_url;
  }

  getVideoUrl() {
    return this.video?.proxy_url;
  }

  getImageUrl() {
    return this.image?.proxy_url;
  }

  getThumbnailUrl() {
    return this.thumbnail?.proxy_url;
  }

  getFooterIconUrl() {
    return this.footer?.proxy_icon_url;
  }

  getExportFileName(type) {
    const name = this.title ? `${this.title}_` : "";
    return `${name}${uuidv4()}.${type}`;
  }

  isMedia() {
    return (
      this.type === "gifv" || this.type === "image" || this.type === "rich"
    );
  }

  getNonMediaUrl() {
    return null;
  }

  getMediaDownloadUrls() {
    switch (this.type) {
      case "gifv":
        return [this.getVideoUrl()].filter(Boolean);
      case "image":
        return [this.getThumbnailUrl()].filter(Boolean);
      case "rich":
        return [
          this.getAuthorIconUrl(),
          this.getImageUrl(),
          this.getThumbnailUrl(),
          this.getFooterIconUrl(),
        ].filter(Boolean);
      default:
        return [];
    }
  }
}

export default Embed;
