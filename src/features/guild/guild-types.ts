import Guild from "../../classes/guild";
import { PreFilterUser } from "../dm/dm-types";

export type GuildState = {
  guilds: Guild[];
  selectedGuild: Guild | Maybe;
  preFilterUsers: PreFilterUser[];
  isLoading: boolean | Maybe;
};
