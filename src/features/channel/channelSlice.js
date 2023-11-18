import { createSlice } from "@reduxjs/toolkit";
import { fetchChannels } from "../../services/discordService";
import {
  resetAdvancedFilters,
  resetFilters,
  resetMessageData,
} from "../message/messageSlice";
import Channel from "../../classes/Channel";

const defaultChannel = {
  flags: null,
  guild_id: null,
  id: null,
  name: null,
  parent_id: null,
  permission_overwrites: [],
  position: null,
  type: null,
};

export const channelSlice = createSlice({
  name: "channel",
  initialState: {
    channels: [],
    selectedChannel: defaultChannel,
    isLoading: null,
    preFilterUserId: null,
    preFilterUserIds: [],
    selectedExportChannels: [], // Array of channel ID's, used for exporting Guild
  },
  reducers: {
    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setChannels: (state, { payload }) => {
      state.channels = payload;
    },
    setPreFilterUserIds: (state, { payload }) => {
      state.preFilterUserIds = payload;
    },
    setChannel: (state, { payload }) => {
      const selectedChannel = state.channels.find(
        (channel) => channel.id === payload
      );
      state.selectedChannel = selectedChannel || defaultChannel;
    },
    resetChannel: (state, { payload }) => {
      state.selectedChannel = defaultChannel;
      state.preFilterUserId = null;
    },
    setPreFilterUserId: (state, { payload }) => {
      state.preFilterUserId = payload;
    },
    setSelectedExportChannels: (state, { payload }) => {
      state.selectedExportChannels = payload;
    },
  },
});

export const {
  setIsLoading,
  setChannels,
  setPreFilterUserIds,
  setChannel,
  resetChannel,
  setPreFilterUserId,
  setSelectedExportChannels,
} = channelSlice.actions;

export const getChannels = (guildId) => async (dispatch, getState) => {
  try {
    if (guildId) {
      const { token, username, id } = getState().user;
      dispatch(setIsLoading(true));
      const data = await fetchChannels(token, guildId);
      if (data) {
        dispatch(
          setChannels(
            data
              .filter((c) => c.type !== 4)
              .map((channel) => new Channel(channel))
          )
        );
        dispatch(setPreFilterUserIds([{ name: username, id: id }]));
      }
      dispatch(setIsLoading(false));
    }
  } catch (e) {
    console.error(e);
    dispatch(setIsLoading(false));
    dispatch(setChannels([]));
  }
};

export const changeChannel = (channelId) => async (dispatch, getState) => {
  if (!channelId) {
    dispatch(resetAdvancedFilters());
    dispatch(setPreFilterUserId(null));
  }
  dispatch(resetFilters());
  dispatch(resetMessageData());
  dispatch(setChannel(channelId));
};

export const selectChannel = (state) => state.channel;

export default channelSlice.reducer;
