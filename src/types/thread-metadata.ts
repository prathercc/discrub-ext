// https://discord.com/developers/docs/resources/channel#thread-metadata-object
export type ThreadMetaData = {
  archived: boolean;
  auto_archive_duration: number;
  archive_timestamp: string;
  locked: boolean;
  invitable?: boolean;
  create_timestamp?: string | Maybe;
};
