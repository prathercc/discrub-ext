class ThreadMetaData {
  constructor(json = {}) {
    const {
      archive_timestamp,
      archived,
      auto_archive_duration,
      create_timestamp,
      locked,
    } = json;
    this.archive_timestamp = archive_timestamp;
    this.archived = archived;
    this.auto_archive_duration = auto_archive_duration;
    this.create_timestamp = create_timestamp;
    this.locked = locked;
  }
}

export default ThreadMetaData;
