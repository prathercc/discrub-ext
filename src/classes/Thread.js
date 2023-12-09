/* eslint-disable no-unused-vars */
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

    Object.assign(this, json, {
      archived: thread_metadata?.archived,
      thread_metadata: thread_metadata
        ? new ThreadMetaData(thread_metadata)
        : null,
    });
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
