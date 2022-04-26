import { fetchGuilds } from "../../discordService";
import {
  GET_GUILDS,
  GET_GUILDS_COMPLETE,
  SET_GUILD,
} from "./GuildContextConstants";

export const getGuilds = async (token, dispatch) => {
  dispatch({ type: GET_GUILDS });
  const data = await fetchGuilds(token);
  dispatch({
    type: GET_GUILDS_COMPLETE,
    payload: [...data],
  });
};

export const setGuild = (id, dispatch) => {
  dispatch({ type: SET_GUILD, payload: { id } });
};
