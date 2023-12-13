import { createSlice } from "@reduxjs/toolkit";
import { fetchGuilds, fetchRoles } from "../../services/discordService";
import { getChannels, resetChannel } from "../channel/channelSlice";
import {
  resetAdvancedFilters,
  resetFilters,
  resetMessageData,
} from "../message/messageSlice";
import Role from "../../classes/Role";
import Guild from "../../classes/Guild";

export const guildSlice = createSlice({
  name: "guild",
  initialState: {
    guilds: [],
    selectedGuild: new Guild(),
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
      state.selectedGuild = new Guild();
    },
  },
});

export const { setIsLoading, setGuilds, setGuild, resetGuild } =
  guildSlice.actions;

export const getRoles = (guildId) => async (dispatch, getState) => {
  const { guilds } = getState().guild;
  const guild = guilds.find((g) => g.id === guildId);
  if (Boolean(guild) && !Boolean(guild.getRoles())) {
    try {
      const { token } = getState().user;
      const data = (await fetchRoles(guildId, token)) || [];
      if (data.length) {
        const updatedGuilds = guilds.map((g) => {
          if (g.id === guildId) {
            return Object.assign(g, {
              roles: data.map((role) => new Role(role)),
            });
          } else {
            return g;
          }
        });
        dispatch(setGuilds(updatedGuilds));
      }
    } catch (e) {
      console.error("Failed to fetch roles for guildId", guildId, e);
    }
  }
};

export const getGuilds = () => async (dispatch, getState) => {
  try {
    const { token } = getState().user;
    dispatch(setIsLoading(true));
    const data = (await fetchGuilds(token)) || [];
    if (data.length) {
      dispatch(setGuilds(data.map((guild) => new Guild(guild))));
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
    await dispatch(getRoles(id));
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
