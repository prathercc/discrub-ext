// https://discord.com/developers/docs/resources/channel#message-reference-object
export type MessageReferenceObject = {
  message_id?: Snowflake;
  channel_id?: Snowflake;
  guild_id?: Snowflake;
  fail_if_not_exists?: boolean;
};
