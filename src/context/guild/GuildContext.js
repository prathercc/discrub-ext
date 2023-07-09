import React, { createContext, useContext, useReducer } from "react";
import { GuildReducer } from "./GuildReducer";
import { UserContext } from "../user/UserContext";
import {
  GET_GUILDS,
  GET_GUILDS_COMPLETE,
  SET_GUILD,
  RESET_GUILD_COMPLETE,
} from "./GuildContextConstants";
import { fetchGuilds } from "../../services/discordService";

export const GuildContext = createContext();

const GuildContextProvider = (props) => {
  const { state: userState } = useContext(UserContext);
  const { token } = userState;

  const [state, dispatch] = useReducer(
    GuildReducer,
    Object.freeze({
      guilds: [],
      selectedGuild: {
        features: [],
        icon: null,
        id: null,
        name: null,
        owner: null,
        permissions: null,
        permissions_new: null,
      },
      isLoading: null,
    })
  );

  const getGuilds = async () => {
    if (token) {
      dispatch({ type: GET_GUILDS });
      const data = await fetchGuilds(token);
      return dispatch({
        type: GET_GUILDS_COMPLETE,
        payload: [...data],
      });
    }
  };

  const setGuild = async (id) => {
    return dispatch({ type: SET_GUILD, payload: { id } });
  };

  const resetGuild = async () => {
    return dispatch({ type: RESET_GUILD_COMPLETE });
  };

  return (
    <GuildContext.Provider
      value={{ state, dispatch, getGuilds, setGuild, resetGuild }}
    >
      {props.children}
    </GuildContext.Provider>
  );
};

export default GuildContextProvider;
