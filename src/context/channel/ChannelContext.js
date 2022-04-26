import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";
import {
  getChannels as getChannelsAction,
  setChannel as setChannelAction,
} from "./ChannelContextActions";
import { ChannelReducer } from "./ChannelReducer";
import { UserContext } from "../user/UserContext";
import { GuildContext } from "../guild/GuildContext";

export const ChannelContext = createContext();

const ChannelContextProvider = (props) => {
  const { state: userState } = useContext(UserContext);
  const { state: guildState } = useContext(GuildContext);

  const { selectedGuild } = guildState;
  const { token } = userState;

  const [state, dispatch] = useReducer(
    ChannelReducer,
    Object.freeze({
      channels: [],
      selectedChannel: {
        flags: null,
        guild_id: null,
        id: null,
        name: null,
        parent_id: null,
        permission_overwrites: [],
        position: null,
        type: null,
      },
      isLoading: null,
    })
  );

  const getChannels = useCallback(async () => {
    if (token && selectedGuild.id)
      await getChannelsAction(token, selectedGuild.id, dispatch);
  }, [token, selectedGuild.id]);

  const setChannel = (id) => {
    setChannelAction(id, dispatch);
  };

  return (
    <ChannelContext.Provider
      value={{ state, dispatch, getChannels, setChannel }}
    >
      {props.children}
    </ChannelContext.Provider>
  );
};

export default ChannelContextProvider;
