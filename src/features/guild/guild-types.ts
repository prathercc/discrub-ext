import Guild from "../../classes/guild";
import { PreFilterUser } from "../dm/dm-types";

export type GuildState = {
  guilds: Guild[];
  selectedGuild: Guild | Maybe;
  preFilterUserId: Snowflake | Maybe;
  preFilterUsers: PreFilterUser[];
  isLoading: boolean | Maybe;
};
