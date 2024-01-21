// https://discord.com/developers/docs/resources/emoji#emoji-object
import { User } from "./user";

export class Emoji {
  id: Snowflake | Maybe;
  name: string | Maybe;
  roles?: Snowflake[];
  user?: User;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;

  constructor(opts: {
    id: Snowflake | Maybe;
    name: string | Maybe;
    roles?: Snowflake[];
    user?: User;
    require_colons?: boolean;
    managed?: boolean;
    animated?: boolean;
    available?: boolean;
  }) {
    this.id = opts.id;
    this.name = opts.name;
    this.roles = opts.roles;
    this.user = opts.user;
    this.require_colons = opts.require_colons;
    this.managed = opts.managed;
    this.animated = opts.animated;
    this.available = opts.available;
  }
}
