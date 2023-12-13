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
import { sortByProperty } from "../../utils";

export const guildSlice = createSlice({
  name: "guild",
  initialState: {
    guilds: [],
    selectedGuild: new Guild(),
    preFilterUserId: null,
    preFilterUserIds: [],
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
      state.preFilterUserId = null;
    },
    setPreFilterUserId: (state, { payload }) => {
      state.preFilterUserId = payload;
    },
    setPreFilterUserIds: (state, { payload }) => {
      state.preFilterUserIds = payload;
    },
  },
});

export const {
  setIsLoading,
  setGuilds,
  setGuild,
  resetGuild,
  setPreFilterUserId,
  setPreFilterUserIds,
} = guildSlice.actions;

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
    dispatch(getPreFilterUsers(id));
  } else {
    dispatch(resetGuild());
  }
  dispatch(resetChannel());
  dispatch(resetFilters());
  dispatch(resetAdvancedFilters());
  dispatch(resetMessageData());
};

export const getPreFilterUsers = (guildId) => (dispatch, getState) => {
  const { id: userId, username: userName } = getState().user;
  const { userMap } = getState().export.exportMaps;
  const preFilterUserIds = Object.keys(userMap).map((key) => {
    const mapping = userMap[key];
    return { name: mapping.userName, id: key };
  });

  const filteredPreFilters = [
    ...preFilterUserIds.filter(
      (mapping) =>
        mapping.id !== userId &&
        Boolean(userMap[mapping.id].guilds[guildId]) &&
        mapping.name !== "Deleted User"
    ),
    { id: userId, name: userName },
  ].toSorted((a, b) => sortByProperty(a, b, "name", "asc"));

  dispatch(setPreFilterUserIds(filteredPreFilters));
};

export const selectGuild = (state) => state.guild;

export default guildSlice.reducer;
