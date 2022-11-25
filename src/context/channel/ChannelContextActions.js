import { fetchChannels } from "../../discordService";
import {
  GET_CHANNELS,
  GET_CHANNELS_COMPLETE,
  SET_CHANNEL,
  RESET_CHANNEL_COMPLETE,
  SET_PREFILTER_USERID,
  SET_SELECTED_EXPORT_CHANNELS,
} from "./ChannelContextConstants";

export const getChannels = async (token, guildId, dispatch) => {
  dispatch({ type: GET_CHANNELS });
  const data = await fetchChannels(token, guildId);
  dispatch({
    type: GET_CHANNELS_COMPLETE,
    payload: [...data],
  });
};

export const setChannel = (id, user, dispatch) => {
  dispatch({ type: SET_CHANNEL, payload: { id, user } });
};

export const resetChannel = (dispatch) => {
  dispatch({ type: RESET_CHANNEL_COMPLETE });
};

export const setPreFilterUserId = (userId, dispatch) => {
  dispatch({ type: SET_PREFILTER_USERID, payload: { userId } });
};

export const setSelectedExportChannels = (selectedExportChannels, dispatch) => {
  dispatch({
    type: SET_SELECTED_EXPORT_CHANNELS,
    payload: { selectedExportChannels },
  });
};
