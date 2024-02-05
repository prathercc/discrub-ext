// https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object-message-interaction-structure
import { User } from "../classes/user";
import { GuildMemberObject } from "./guild-member-object";

export type MessageInteractionObject = {
  id: Snowflake;
  type: string;
  name: string;
  user: User;
  member?: GuildMemberObject;
};
