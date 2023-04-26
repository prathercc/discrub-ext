import {
  GET_CHANNELS,
  GET_CHANNELS_COMPLETE,
  SET_CHANNEL,
  RESET_CHANNEL_COMPLETE,
  SET_PREFILTER_USERID,
  SET_SELECTED_EXPORT_CHANNELS,
} from "./ChannelContextConstants";
export const ChannelReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_CHANNELS:
      return { ...state, isLoading: true };
    case GET_CHANNELS_COMPLETE:
      const { data, user } = payload;
      return {
        ...state,
        channels: data.filter((c) => c.type !== 4),
        isLoading: false,
        preFilterUserIds: [{ name: user.name, id: user.id }],
      };
    case SET_CHANNEL:
      const selectedChannel = state.channels.find(
        (channel) => channel.id === payload.id
      );
      return {
        ...state,
        selectedChannel: selectedChannel || {
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
    case SET_PREFILTER_USERID:
      return { ...state, preFilterUserId: payload.userId };
    case SET_SELECTED_EXPORT_CHANNELS:
      return {
        ...state,
        selectedExportChannels: payload.selectedExportChannels,
      };
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
        preFilterUserId: null,
      };
    default:
      return { ...state, ...payload };
  }
};
