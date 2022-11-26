import React, { createContext, useContext, useReducer } from "react";
import {
  getChannels as getChannelsAction,
  setChannel as setChannelAction,
  resetChannel as resetChannelAction,
  setPreFilterUserId as setPreFilterUserIdAction,
  setSelectedExportChannels as setSelectedExportChannelsAction,
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
      selectedExportChannels: [], // Array of channel ID's, used for exporting Guild
    })
  );

  const getChannels = async (selectedGuildId) => {
    if (token) return await getChannelsAction(token, selectedGuildId, dispatch);
  };

  const setChannel = async (id) => {
    await setChannelAction(id, { name: username, id: userId }, dispatch);
  };

  const resetChannel = async () => {
    await resetChannelAction(dispatch);
  };

  const setPreFilterUserId = async (userId) => {
    await setPreFilterUserIdAction(userId, dispatch);
  };

  const setSelectedExportChannels = async (selectedExportChannels) => {
    await setSelectedExportChannelsAction(selectedExportChannels, dispatch);
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
        setSelectedExportChannels,
      }}
    >
      {props.children}
    </ChannelContext.Provider>
  );
};

export default ChannelContextProvider;
