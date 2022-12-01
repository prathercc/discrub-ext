import React, { createContext, useContext, useReducer } from "react";
import {
  getGuilds as getGuildsAction,
  setGuild as setGuildAction,
  resetGuild as resetGuildAction,
} from "./GuildContextActions";
import { GuildReducer } from "./GuildReducer";
import { UserContext } from "../user/UserContext";

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
    if (token) await getGuildsAction(token, dispatch);
  };

  const setGuild = async (id) => {
    await setGuildAction(id, dispatch);
  };

  const resetGuild = async () => {
    await resetGuildAction(dispatch);
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
