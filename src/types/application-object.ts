// https://discord.com/developers/docs/resources/application#application-object
import Guild from "../classes/guild";
import { User } from "../classes/user";
import { InstallParamsObject } from "./install-params-object";
import { TeamObject } from "./team-object";

export type ApplicationObject = {
  id: Snowflake;
  name: string;
  icon: string | Maybe;
  description: string;
  rpc_origins?: string[];
  bot_public: boolean;
  bot_require_code_grant: boolean;
  bot?: User;
  terms_of_service_url?: string;
  privacy_policy_url?: string;
  owner?: User;
  summary: string;
  verify_key: string;
  team: TeamObject | Maybe;
  guild_id?: Snowflake;
  guild?: Guild;
  primary_sku_id?: Snowflake;
  slug?: string;
  cover_image?: string;
  flags?: number;
  approximate_guild_count?: number;
  redirect_uris?: string[];
  interactions_endpoint_url?: string;
  role_connections_verification_url?: string;
  tags?: string[];
  install_params?: InstallParamsObject;
  custom_install_url?: string;
};
