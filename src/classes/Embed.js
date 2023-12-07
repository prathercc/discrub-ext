import { v4 as uuidv4 } from "uuid";
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
    this.type = type;
    this.description = description;
    this.color = color;
    this.fields = fields;
    this.author = author;
    this.image = image;
    this.thumbnail = thumbnail;
    this.video = video;
    this.footer = footer;
    this.timestamp = timestamp;
    this.title = title;
    this.url = url;
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
