// https://discord.com/developers/docs/topics/permissions#role-object
import { RoleTags } from "../types/role-tags";

class Role {
  id: Snowflake;
  name: string;
  color: number;
  hoist: boolean;
  icon?: string | Maybe;
  unicode_emoji?: string | Maybe;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: RoleTags;
  flags: number;

  constructor(opts: {
    id: Snowflake;
    name: string;
    color: number;
    hoist: boolean;
    icon?: string | Maybe;
    unicode_emoji?: string | Maybe;
    position: number;
    permissions: string;
    managed: boolean;
    mentionable: boolean;
    tags?: RoleTags;
    flags: number;
  }) {
    this.id = opts.id;
    this.name = opts.name;
    this.color = opts.color;
    this.hoist = opts.hoist;
    this.icon = opts.icon;
    this.unicode_emoji = opts.unicode_emoji;
    this.position = opts.position;
    this.permissions = opts.permissions;
    this.managed = opts.managed;
    this.mentionable = opts.mentionable;
    this.tags = opts.tags;
    this.flags = opts.flags;
  }
}

export default Role;
