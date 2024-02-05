import Channel from "../../classes/channel";

export type PurgeState = {
  isLoading: boolean | null;
  purgeChannel: Channel | null;
};
