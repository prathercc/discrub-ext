// https://discord.com/developers/docs/resources/sticker#sticker-object
import { User } from "../classes/user";

export type StickerObject = {
  id: Snowflake;
  pack_id?: Snowflake;
  name: string;
  description: string | Maybe;
  tags: string;
  asset?: string;
  type: number;
  format_type: number;
  available?: boolean;
  guild_id?: Snowflake;
  user?: User;
  sort_value?: number;
};
