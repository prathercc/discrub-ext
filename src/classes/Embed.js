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
    } = json;
    this.type = type;
    this.description = description;
    this.color = color;
    this.fields = fields;
    this.author = author;
    this.image = image;
    this.thumbnail = thumbnail;
    this.footer = footer;
    this.timestamp = timestamp;
    this.title = title;
    this.url = url;
  }

  getAuthorIconUrl() {
    return this.author?.icon_url;
  }

  getImageUrl() {
    return this.image?.url;
  }

  getThumbnailUrl() {
    return this.thumbnail?.url;
  }

  getFooterIconUrl() {
    return this.footer?.icon_url;
  }
}

export default Embed;
