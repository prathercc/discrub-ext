import { fetchGuilds } from "../../discordService";
import {
  GET_GUILDS,
  GET_GUILDS_COMPLETE,
  SET_GUILD,
  RESET_GUILD_COMPLETE,
} from "./GuildContextConstants";

export const getGuilds = async (token, dispatch) => {
  dispatch({ type: GET_GUILDS });
  const data = await fetchGuilds(token);
  return dispatch({
    type: GET_GUILDS_COMPLETE,
    payload: [...data],
  });
};

export const setGuild = (id, dispatch) => {
  return dispatch({ type: SET_GUILD, payload: { id } });
};

export const resetGuild = (dispatch) => {
  return dispatch({ type: RESET_GUILD_COMPLETE });
};
