import { fetchDirectMessages } from "../../discordService";
import {
  GET_DMS,
  GET_DMS_COMPLETE,
  SET_DM,
  RESET_DM_COMPLETE,
  SET_PREFILTER_USERID,
} from "./DmContextConstants";

export const getDms = async (token, dispatch) => {
  dispatch({ type: GET_DMS });
  const data = await fetchDirectMessages(token);
  return dispatch({
    type: GET_DMS_COMPLETE,
    payload: [...data],
  });
};

export const setDm = (id, user, dispatch) => {
  return dispatch({ type: SET_DM, payload: { id, user } });
};

export const resetDm = (dispatch) => {
  return dispatch({ type: RESET_DM_COMPLETE });
};

export const setPreFilterUserId = (userId, dispatch) => {
  return dispatch({ type: SET_PREFILTER_USERID, payload: { userId } });
};
