import Channel from "../../classes/channel";

export type DmState = {
  dms: Channel[];
  selectedDm: Channel | Maybe;
  isLoading: boolean | Maybe;
  preFilterUserId: Snowflake | Maybe;
  preFilterUsers: PreFilterUser[];
};

export type PreFilterUser = {
  name: string | Maybe;
  id: Snowflake;
};

export type SetDmProps = {
  dmId: Snowflake;
  preFilterUser: PreFilterUser;
};
