// https://discord.com/developers/docs/resources/channel#allowed-mentions-object
export type AllowedMentionObject = {
  parse: string[];
  roles: Snowflake[];
  users: Snowflake[];
  replied_user: boolean;
};
