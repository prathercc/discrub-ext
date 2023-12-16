import { createSlice } from "@reduxjs/toolkit";
import { fetchChannels } from "../../services/discordService";
import {
  resetAdvancedFilters,
  resetFilters,
  resetMessageData,
} from "../message/messageSlice";
import Channel from "../../classes/Channel";
import { setPreFilterUserId } from "../guild/guildSlice";

export const channelSlice = createSlice({
  name: "channel",
  initialState: {
    channels: [],
    selectedChannel: new Channel(),
    isLoading: null,
    selectedExportChannels: [], // Array of channel ID's, used for exporting Guild
  },
  reducers: {
    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setChannels: (state, { payload }) => {
      state.channels = payload;
    },
    setChannel: (state, { payload }) => {
      const selectedChannel = state.channels.find(
        (channel) => channel.id === payload
      );
      state.selectedChannel = selectedChannel || new Channel();
    },
    resetChannel: (state, { payload }) => {
      state.selectedChannel = new Channel();
    },
    setSelectedExportChannels: (state, { payload }) => {
      state.selectedExportChannels = payload;
    },
  },
});

export const {
  setIsLoading,
  setChannels,
  setChannel,
  resetChannel,
  setSelectedExportChannels,
} = channelSlice.actions;

export const getChannels = (guildId) => async (dispatch, getState) => {
  try {
    if (guildId) {
      const { token } = getState().user;
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
      }
      dispatch(setIsLoading(false));
    }
  } catch (e) {
    console.error("Failed to fetch channels from guild id", e, guildId);
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
