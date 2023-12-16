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

  getIconUrl() {
    const recipientCount = this.recipients?.length;

    if (this.isGroupDm()) {
      return "default_group_chat_icon.png";
    }

    if (this.isDm() && Boolean(this.recipients?.[0]?.avatar)) {
      return `https://cdn.discordapp.com/avatars/${this.recipients[0].id}/${this.recipients[0].avatar}`;
    }

    return "default_dm_icon.png";
  }

  getRecipientCount() {
    return Number(this.recipients?.length);
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

  isGroupDm() {
    return this.type === ChannelType.GROUP_DM;
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
