import {
  GET_GUILDS,
  GET_GUILDS_COMPLETE,
  SET_GUILD,
  RESET_GUILD_COMPLETE,
} from "./GuildContextConstants";
export const GuildReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_GUILDS:
      return { ...state, isLoading: true };
    case GET_GUILDS_COMPLETE:
      return { ...state, guilds: [...payload], isLoading: false };
    case SET_GUILD:
      const selectedGuild = state.guilds.find(
        (guild) => guild.id === payload.id
      );
      return { ...state, selectedGuild: selectedGuild };
    case RESET_GUILD_COMPLETE:
      return {
        ...state,
        selectedGuild: {
          features: [],
          icon: null,
          id: null,
          name: null,
          owner: null,
          permissions: null,
          permissions_new: null,
        },
      };
    default:
      return { ...state, ...payload };
  }
};
