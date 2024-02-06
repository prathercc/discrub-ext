import Channel from "../../classes/channel";

export type ChannelState = {
  channels: Channel[];
  selectedChannel: Channel | Maybe;
  isLoading: boolean | Maybe;
  selectedExportChannels: Snowflake[];
};
