// https://discord.com/developers/docs/resources/channel#channel-mention-object
export type ChannelMentionObject = {
  id: Snowflake;
  guild_id: Snowflake;
  type: number;
  name: string;
};
