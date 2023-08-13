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
}
export default Attachment;
