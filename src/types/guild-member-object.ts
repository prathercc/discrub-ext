// https://discord.com/developers/docs/resources/guild#guild-member-object
import { User } from "../classes/user";

export type GuildMemberObject = {
  user?: User;
  nick?: string | Maybe;
  avatar?: string | Maybe;
  roles: Snowflake[];
  joined_at: string;
  premium_since?: string | Maybe;
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string | Maybe;
};
