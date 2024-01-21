// https://discord.com/developers/docs/topics/teams#data-models-team-member-object
import { User } from "../classes/user";

export type TeamMemberObject = {
  membership_state: number;
  team_id: Snowflake;
  user: User;
  role: string;
};
