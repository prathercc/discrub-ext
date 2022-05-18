import React, {
  createContext,
  useCallback,
  useReducer,
  useContext,
} from "react";
import {
  getDms as getDmsAction,
  setDm as setDmAction,
  resetDm as resetDmAction,
} from "./DmContextActions";
import { DmReducer } from "./DmReducer";
import { UserContext } from "../user/UserContext";

export const DmContext = createContext();

const DmContextProvider = (props) => {
  const { state: userState } = useContext(UserContext);

  const { token } = userState;

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
    })
  );

  const getDms = useCallback(async () => {
    if (token) await getDmsAction(token, dispatch);
  }, [token]);

  const setDm = (id) => {
    setDmAction(id, dispatch);
  };

  const resetDm = useCallback(async () => {
    await resetDmAction(dispatch);
  }, []);

  return (
    <DmContext.Provider
      value={{
        state,
        dispatch,
        getDms,
        setDm,
        resetDm,
      }}
    >
      {props.children}
    </DmContext.Provider>
  );
};

export default DmContextProvider;
