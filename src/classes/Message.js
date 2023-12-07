import { MessageType } from "../enum/MessageType";
import Attachment from "./Attachment";
import Author from "./Author";
import Embed from "./Embed";

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
    this.author = new Author(author);
    this.channel_id = channel_id;
    this.components = components;
    this.content = content;
    this.edited_timestamp = edited_timestamp;
    this.embeds = embeds.map((e) => new Embed(e));
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

  isReply() {
    return this.type === MessageType.REPLY;
  }

  getSafeCopy() {
    return new Message({ ...this });
  }

  getChannelId() {
    return this.channel_id;
  }

  getAvatarUrl() {
    return this.author?.avatar
      ? `https://cdn.discordapp.com/avatars/${this.author.id}/${this.author.avatar}`
      : "default_avatar.png";
  }

  getAuthor() {
    return this.author;
  }

  getEmbeds() {
    return this.embeds || [];
  }

  getAttachments() {
    return this.attachments || [];
  }

  getRichEmbeds() {
    return this.getEmbeds().filter((embed) => embed.type === "rich");
  }
}
export default Message;
