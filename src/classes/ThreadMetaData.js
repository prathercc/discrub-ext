/* eslint-disable no-unused-vars */
class ThreadMetaData {
  constructor(json = {}) {
    const {
      archive_timestamp,
      archived,
      auto_archive_duration,
      create_timestamp,
      locked,
    } = json;
    Object.assign(this, json);
  }
}

export default ThreadMetaData;
