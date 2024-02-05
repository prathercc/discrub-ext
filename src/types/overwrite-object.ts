// https://discord.com/developers/docs/resources/channel#overwrite-object
export type OverwriteObject = {
  id: Snowflake;
  type: number;
  allow: string;
  deny: string;
};
