// https://discord.com/developers/docs/resources/guild#welcome-screen-object-welcome-screen-channel-structure
export type WelcomeScreenChannelObject = {
  channel_id: Snowflake;
  description: string;
  emoji_id: Snowflake | Maybe;
  emoji_name: string | Maybe;
};
