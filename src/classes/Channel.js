/* eslint-disable no-unused-vars */
import { ChannelType } from "../enum/ChannelType";
import Thread from "./Thread";

class Channel {
  constructor(json = {}) {
    const {
      flags,
      guild_id,
      id,
      name,
      parent_id,
      permission_overwrites,
      position,
      type,
      last_message_id,
      nsfw,
      rate_limit_per_user,
      topic,
      bitrate,
      rtc_region,
      user_limit,
      recipients,
      owner_id,
      icon,
      thread,
    } = json;
    Object.assign(this, json, { thread: thread ? new Thread(thread) : null });
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.topic;
  }

  getGuildId() {
    return this.guild_id;
  }

  isDm() {
    return [ChannelType.DM, ChannelType.GROUP_DM].some(
      (type) => type === this.type
    );
  }

  isGuildForum() {
    return [ChannelType.GUILD_FORUM, ChannelType.GUILD_MEDIA].some(
      (type) => type === this.type
    );
  }

  isPublicThread() {
    return this.type === ChannelType.PUBLIC_THREAD;
  }

  isPrivateThread() {
    return this.type === ChannelType.PRIVATE_THREAD;
  }
}
export default Channel;
