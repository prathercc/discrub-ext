import React, {
  createContext,
  useCallback,
  useReducer,
  useContext,
} from "react";
import {
  getMessageData as getMessageDataAction,
  resetMessageData as resetMessageDataAction,
} from "./MessageContextActions";
import { MessageReducer } from "./MessageReducer";
import { UserContext } from "../user/UserContext";

export const MessageContext = createContext();

const MessageContextProvider = (props) => {
  const { state: userState } = useContext(UserContext);

  const { token } = userState;

  const [state, dispatch] = useReducer(
    MessageReducer,
    Object.freeze({
      messages: [],
      selectedMessages: [],
      fetchedMessageLength: 0,
      isLoading: null,
    })
  );

  const getMessageData = useCallback(
    async (channelId) => {
      if (channelId && token)
        await getMessageDataAction(channelId, token, dispatch);
    },
    [token]
  );

  const resetMessageData = useCallback(async () => {
    await resetMessageDataAction(dispatch);
  }, []);

  return (
    <MessageContext.Provider
      value={{ state, dispatch, getMessageData, resetMessageData }}
    >
      {props.children}
    </MessageContext.Provider>
  );
};

export default MessageContextProvider;
