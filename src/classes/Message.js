import Attachment from "./Attachment";

class Message {
  constructor(json) {
    const {
      attachments,
      author,
      channel_id,
      components,
      content,
      edited_timestamp,
      embeds,
      flags,
      hit,
      id,
      mention_everyone,
      mentions,
      message_reference,
      pinned,
      timestamp,
      tts,
      username,
    } = json;
    this.attachments = attachments.map((a) => new Attachment(a));
    this.author = author;
    this.channel_id = channel_id;
    this.components = components;
    this.content = content;
    this.edited_timestamp = edited_timestamp;
    this.embeds = embeds;
    this.flags = flags;
    this.hit = hit;
    this.id = id;
    this.mention_everyone = mention_everyone;
    this.mentions = mentions;
    this.pinned = pinned;
    this.timestamp = timestamp;
    this.tts = tts;
    this.type = json.type;
    this.username = username;
    this.message_reference = message_reference;
  }
}
export default Message;
