import ThreadMetaData from "./ThreadMetaData";

class Thread {
  constructor(json = {}) {
    const {
      bitrate,
      flags,
      guild_id,
      id,
      last_message_id,
      member_count,
      member_ids_preview,
      message_count,
      name,
      owner_id,
      parent_id,
      rate_limit_per_user,
      rtc_region,
      thread_metadata,
      total_message_sent,
      type,
      user_limit,
    } = json;

    this.bitrate = bitrate;
    this.flags = flags;
    this.guild_id = guild_id;
    this.id = id;
    this.last_message_id = last_message_id;
    this.member_count = member_count;
    this.member_ids_preview = member_ids_preview;
    this.message_count = message_count;
    this.name = name;
    this.owner_id = owner_id;
    this.parent_id = parent_id;
    this.rate_limit_per_user = rate_limit_per_user;
    this.rtc_region = rtc_region;
    this.thread_metadata = thread_metadata
      ? new ThreadMetaData(thread_metadata)
      : null;
    this.total_message_sent = total_message_sent;
    this.type = type;
    this.user_limit = user_limit;
    this.archived = thread_metadata?.archived;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getLockedOrArchived() {
    return (
      this.archived ||
      this.thread_metadata?.archived ||
      this.thread_metadata?.locked
    );
  }

  unarchive() {
    this.archived = false;
    if (this.thread_metadata) {
      this.thread_metadata.archived = false;
      this.thread_metadata.locked = false;
    }
  }
}

export default Thread;
