import { fetchDirectMessages } from "../../discordService";
import {
  GET_DMS,
  GET_DMS_COMPLETE,
  SET_DM,
  RESET_DM_COMPLETE,
} from "./DmContextConstants";

export const getDms = async (token, dispatch) => {
  dispatch({ type: GET_DMS });
  const data = await fetchDirectMessages(token);
  dispatch({
    type: GET_DMS_COMPLETE,
    payload: [...data],
  });
};

export const setDm = (id, dispatch) => {
  dispatch({ type: SET_DM, payload: { id } });
};

export const resetDm = (dispatch) => {
  dispatch({ type: RESET_DM_COMPLETE });
};
