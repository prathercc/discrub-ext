import {
  GET_CHANNELS,
  GET_CHANNELS_COMPLETE,
  SET_CHANNEL,
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
    default:
      return { ...state, ...payload };
  }
};
