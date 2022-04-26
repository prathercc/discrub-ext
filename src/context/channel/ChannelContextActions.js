import { fetchChannels } from "../../discordService";
import {
  GET_CHANNELS,
  GET_CHANNELS_COMPLETE,
  SET_CHANNEL,
} from "./ChannelContextConstants";

export const getChannels = async (token, guildId, dispatch) => {
  dispatch({ type: GET_CHANNELS });
  const data = await fetchChannels(token, guildId);
  dispatch({
    type: GET_CHANNELS_COMPLETE,
    payload: [...data],
  });
};

export const setChannel = (id, dispatch) => {
  dispatch({ type: SET_CHANNEL, payload: { id } });
};
