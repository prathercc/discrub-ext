import { createSlice } from "@reduxjs/toolkit";
import { fetchGuilds } from "../../services/discordService";

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
      const selectedGuild = state.guilds.find(
        (guild) => guild.id === payload.id
      );
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
  const { token } = getState().user;
  dispatch(setIsLoading(true));
  const data = (await fetchGuilds(token)) || [];
  if (data.length) {
    dispatch(setGuilds(data));
  }
  dispatch(setIsLoading(false));
};

export default guildSlice.reducer;
