import { createSlice } from "@reduxjs/toolkit";
import { fetchGuilds } from "../../services/discordService";
import { getChannels, resetChannel } from "../channel/channelSlice";
import {
  resetAdvancedFilters,
  resetFilters,
  resetMessageData,
} from "../message/messageSlice";

const defaultGuild = {
  features: [],
  icon: null,
  id: null,
  name: null,
  owner: null,
  permissions: null,
  permissions_new: null,
};

export const guildSlice = createSlice({
  name: "guild",
  initialState: {
    guilds: [],
    selectedGuild: defaultGuild,
    isLoading: null,
  },
  reducers: {
    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setGuilds: (state, { payload }) => {
      state.guilds = payload;
    },
    setGuild: (state, { payload }) => {
      const selectedGuild = state.guilds.find((guild) => guild.id === payload);
      state.selectedGuild = selectedGuild;
    },
    resetGuild: (state, { payload }) => {
      state.selectedGuild = defaultGuild;
    },
  },
});

export const { setIsLoading, setGuilds, setGuild, resetGuild } =
  guildSlice.actions;

export const getGuilds = () => async (dispatch, getState) => {
  try {
    const { token } = getState().user;
    dispatch(setIsLoading(true));
    const data = (await fetchGuilds(token)) || [];
    if (data.length) {
      dispatch(setGuilds(data));
    }
    dispatch(setIsLoading(false));
  } catch (e) {
    console.error("Failed to fetch guilds", e);
    dispatch(setIsLoading(false));
    dispatch(setGuilds([]));
  }
};

export const changeGuild = (id) => async (dispatch, getState) => {
  if (id) {
    dispatch(setGuild(id));
    await dispatch(getChannels(id));
  } else {
    dispatch(resetGuild());
  }
  dispatch(resetChannel());
  dispatch(resetFilters());
  dispatch(resetAdvancedFilters());
  dispatch(resetMessageData());
};

export const selectGuild = (state) => state.guild;

export default guildSlice.reducer;
