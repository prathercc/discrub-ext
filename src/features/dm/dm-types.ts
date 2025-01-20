import Channel from "../../classes/channel";

export type DmState = {
  dms: Channel[];
  selectedDms: Channel[];
  isLoading: boolean | Maybe;
  preFilterUsers: PreFilterUser[];
};

export type PreFilterUser = {
  name: string | Maybe;
  id: Snowflake;
};

export type SetSelectedDmsProps = {
  dmIds: Snowflake[];
  preFilterUser: PreFilterUser;
};
