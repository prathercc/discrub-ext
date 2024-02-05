// https://discord.com/developers/docs/topics/teams#data-models-team-object
import { TeamMemberObject } from "./team-member-object";

export type TeamObject = {
  icon: string | Maybe;
  id: Snowflake;
  members: TeamMemberObject[];
  name: string;
  owner_user_id: Snowflake;
};
