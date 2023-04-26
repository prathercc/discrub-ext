import React, { createContext, useContext, useReducer } from "react";
import {
  GET_CHANNELS,
  GET_CHANNELS_COMPLETE,
  SET_CHANNEL,
  RESET_CHANNEL_COMPLETE,
  SET_PREFILTER_USERID,
  SET_SELECTED_EXPORT_CHANNELS,
} from "./ChannelContextConstants";
import { ChannelReducer } from "./ChannelReducer";
import { UserContext } from "../user/UserContext";
import { fetchChannels } from "../../discordService";

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
    if (token) {
      dispatch({ type: GET_CHANNELS });
      const data = await fetchChannels(token, selectedGuildId);
      return dispatch({
        type: GET_CHANNELS_COMPLETE,
        payload: { data, user: { name: username, id: userId } },
      });
    }
  };

  const setChannel = async (id) => {
    return dispatch({
      type: SET_CHANNEL,
      payload: { id },
    });
  };

  const resetChannel = async () => {
    return dispatch({ type: RESET_CHANNEL_COMPLETE });
  };

  const setPreFilterUserId = async (userId) => {
    return dispatch({ type: SET_PREFILTER_USERID, payload: { userId } });
  };

  const setSelectedExportChannels = async (selectedExportChannels) => {
    return dispatch({
      type: SET_SELECTED_EXPORT_CHANNELS,
      payload: { selectedExportChannels },
    });
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
