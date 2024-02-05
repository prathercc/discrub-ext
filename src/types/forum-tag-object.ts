// https://discord.com/developers/docs/resources/channel#forum-tag-object
export type ForumTagObject = {
  id: Snowflake;
  name: string;
  moderated: boolean;
  emoji_id: string | Maybe;
  emoji_name: string | Maybe;
};
