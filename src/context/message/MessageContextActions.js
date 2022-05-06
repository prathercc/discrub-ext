import { fetchMessageData } from "../../discordService";
import {
  GET_MESSAGE_DATA,
  GET_MESSAGE_DATA_COMPLETE,
  UPDATE_FETCHED_MESSAGES,
  RESET_MESSAGE_DATA_COMPLETE,
} from "./MessageContextConstants";

export const resetMessageData = async (dispatch) => {
  dispatch({ type: RESET_MESSAGE_DATA_COMPLETE });
};

export const getMessageData = async (channelId, token, dispatch) => {
  dispatch({ type: GET_MESSAGE_DATA });
  let retArr = [];
  try {
    let lastId = "";
    let reachedEnd = false;
    while (!reachedEnd) {
      const data = await fetchMessageData(token, lastId, channelId);
      if (data.message && data.message.includes("Missing Access")) {
        break;
      }
      if (data.length < 100) {
        reachedEnd = true;
      }
      if (data.length > 0) {
        lastId = data[data.length - 1].id;
      }
      if (data && (data[0]?.content || data[0]?.attachments)) {
        retArr = retArr.concat(data);
        dispatch({
          type: UPDATE_FETCHED_MESSAGES,
          payload: { fetchedMessageLength: retArr.length },
        });
      }
    }
  } catch (e) {
    console.error("Error fetching channel messages");
  } finally {
    dispatch({
      type: GET_MESSAGE_DATA_COMPLETE,
      payload: {
        messages: retArr.map((message) => ({
          ...message,
          username: message.author.username,
        })),
      },
    });
  }
};
