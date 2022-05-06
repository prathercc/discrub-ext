import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";
import {
  getChannels as getChannelsAction,
  setChannel as setChannelAction,
  resetChannel as resetChannelAction,
} from "./ChannelContextActions";
import { ChannelReducer } from "./ChannelReducer";
import { UserContext } from "../user/UserContext";

export const ChannelContext = createContext();

const ChannelContextProvider = (props) => {
  const { state: userState } = useContext(UserContext);

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

  const getChannels = useCallback(
    async (selectedGuildId) => {
      if (token) await getChannelsAction(token, selectedGuildId, dispatch);
    },
    [token]
  );

  const setChannel = (id) => {
    setChannelAction(id, dispatch);
  };

  const resetChannel = useCallback(async () => {
    await resetChannelAction(dispatch);
  }, []);

  return (
    <ChannelContext.Provider
      value={{ state, dispatch, getChannels, setChannel, resetChannel }}
    >
      {props.children}
    </ChannelContext.Provider>
  );
};

export default ChannelContextProvider;
