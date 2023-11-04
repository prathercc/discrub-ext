class Channel {
  constructor(json) {
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
    } = json;
    this.flags = flags;
    this.guild_id = guild_id;
    this.id = id;
    this.name = name;
    this.parent_id = parent_id;
    this.permission_overwrites = permission_overwrites;
    this.position = position;
    this.type = type;
    this.last_message_id = last_message_id;
    this.nsfw = nsfw;
    this.rate_limit_per_user = rate_limit_per_user;
    this.topic = topic;
    this.bitrate = bitrate;
    this.rtc_region = rtc_region;
    this.user_limit = user_limit;
  }

  isDm() {
    return false;
  }
}
export default Channel;
