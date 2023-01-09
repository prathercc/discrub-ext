import React, { createContext, useReducer, useContext } from "react";
import { DmReducer } from "./DmReducer";
import { UserContext } from "../user/UserContext";
import {
  GET_DMS,
  GET_DMS_COMPLETE,
  SET_DM,
  RESET_DM_COMPLETE,
  SET_PREFILTER_USERID,
} from "./DmContextConstants";
import { fetchDirectMessages } from "../../discordService";

export const DmContext = createContext();

const DmContextProvider = (props) => {
  const { state: userState } = useContext(UserContext);

  const { token, id: userId, username } = userState;

  const [state, dispatch] = useReducer(
    DmReducer,
    Object.freeze({
      dms: [],
      selectedDm: {
        id: null,
        name: null,
        type: null,
        recipients: [],
        owner_id: null,
      },
      isLoading: null,
      preFilterUserId: null,
      preFilterUserIds: [],
    })
  );

  const getDms = async () => {
    if (token) {
      dispatch({ type: GET_DMS });
      const data = await fetchDirectMessages(token);
      return dispatch({
        type: GET_DMS_COMPLETE,
        payload: [...data],
      });
    }
  };

  const setDm = async (id) => {
    return dispatch({
      type: SET_DM,
      payload: { id, user: { name: username, id: userId } },
    });
  };

  const resetDm = async () => {
    return dispatch({ type: RESET_DM_COMPLETE });
  };

  const setPreFilterUserId = async (userId) => {
    return dispatch({ type: SET_PREFILTER_USERID, payload: { userId } });
  };

  return (
    <DmContext.Provider
      value={{
        state,
        dispatch,
        getDms,
        setDm,
        resetDm,
        setPreFilterUserId,
      }}
    >
      {props.children}
    </DmContext.Provider>
  );
};

export default DmContextProvider;
