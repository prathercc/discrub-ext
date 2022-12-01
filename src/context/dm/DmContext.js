import React, { createContext, useReducer, useContext } from "react";
import {
  getDms as getDmsAction,
  setDm as setDmAction,
  resetDm as resetDmAction,
  setPreFilterUserId as setPreFilterUserIdAction,
} from "./DmContextActions";
import { DmReducer } from "./DmReducer";
import { UserContext } from "../user/UserContext";

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
    if (token) await getDmsAction(token, dispatch);
  };

  const setDm = async (id) => {
    await setDmAction(id, { name: username, id: userId }, dispatch);
  };

  const resetDm = async () => {
    await resetDmAction(dispatch);
  };

  const setPreFilterUserId = async (userId) => {
    await setPreFilterUserIdAction(userId, dispatch);
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
