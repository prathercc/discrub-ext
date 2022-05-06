import {
  GET_CHANNELS,
  GET_CHANNELS_COMPLETE,
  SET_CHANNEL,
  RESET_CHANNEL_COMPLETE,
} from "./ChannelContextConstants";
export const ChannelReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_CHANNELS:
      return { ...state, isLoading: true };
    case GET_CHANNELS_COMPLETE:
      return { ...state, channels: [...payload], isLoading: false };
    case SET_CHANNEL:
      const selectedChannel = state.channels.find(
        (channel) => channel.id === payload.id
      );
      return { ...state, selectedChannel: selectedChannel };
    case RESET_CHANNEL_COMPLETE:
      return {
        ...state,
        selectedChannel: {
          flags: null,
          guild_id: null,
          id: null,
          name: null,
          parent_id: null,
          permission_overwrites: [],
          position: null,
          type: null,
        },
      };
    default:
      return { ...state, ...payload };
  }
};
