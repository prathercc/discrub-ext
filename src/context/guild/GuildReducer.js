import {
  GET_GUILDS,
  GET_GUILDS_COMPLETE,
  SET_GUILD,
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
    default:
      return { ...state, ...payload };
  }
};
