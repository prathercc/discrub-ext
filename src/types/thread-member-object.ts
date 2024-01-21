// https://discord.com/developers/docs/resources/channel#thread-member-object
import { GuildMemberObject } from "./guild-member-object";

export type ThreadMemberObject = {
  id?: Snowflake;
  user_id?: Snowflake;
  join_timestamp: string;
  flags: number;
  member?: GuildMemberObject;
};
