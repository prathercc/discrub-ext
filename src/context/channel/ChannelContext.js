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
  setPreFilterUserId as setPreFilterUserIdAction,
} from "./ChannelContextActions";
import { ChannelReducer } from "./ChannelReducer";
import { UserContext } from "../user/UserContext";

export const ChannelContext = createContext();

const ChannelContextProvider = (props) => {
  const { state: userState } = useContext(UserContext);

  const { token, id: userId, username } = userState;

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
      preFilterUserId: null,
      preFilterUserIds: [],
    })
  );

  const getChannels = useCallback(
    async (selectedGuildId) => {
      if (token) await getChannelsAction(token, selectedGuildId, dispatch);
    },
    [token]
  );

  const setChannel = (id) => {
    setChannelAction(id, { name: username, id: userId }, dispatch);
  };

  const resetChannel = useCallback(async () => {
    await resetChannelAction(dispatch);
  }, []);

  const setPreFilterUserId = async (userId) => {
    setPreFilterUserIdAction(userId, dispatch);
  };

  return (
    <ChannelContext.Provider
      value={{
        state,
        dispatch,
        getChannels,
        setChannel,
        resetChannel,
        setPreFilterUserId,
      }}
    >
      {props.children}
    </ChannelContext.Provider>
  );
};

export default ChannelContextProvider;
