import React, {
  createContext,
  useCallback,
  useReducer,
  useContext,
  useRef,
  useEffect,
} from "react";
import {
  getMessageData as getMessageDataAction,
  resetMessageData as resetMessageDataAction,
  filterMessages as filterMessagesAction,
  updateFilters as updateFiltersAction,
} from "./MessageContextActions";
import { MessageReducer } from "./MessageReducer";
import { UserContext } from "../user/UserContext";
import { ChannelContext } from "../channel/ChannelContext";

export const MessageContext = createContext();

const MessageContextProvider = (props) => {
  const { state: userState } = useContext(UserContext);
  const { state: channelState } = useContext(ChannelContext);

  const selectedChannelIdRef = useRef();

  const { token } = userState;
  const { selectedChannel } = channelState;

  selectedChannelIdRef.current = selectedChannel.id; // Needed incase channelId changes and we can cancel the fetching.

  const [state, dispatch] = useReducer(
    MessageReducer,
    Object.freeze({
      messages: [],
      selectedMessages: [],
      filteredMessages: [],
      filters: [],
      fetchedMessageLength: 0,
      isLoading: null,
    })
  );

  const getMessageData = useCallback(async () => {
    if (selectedChannel.id && token)
      await getMessageDataAction(selectedChannelIdRef, token, dispatch);
  }, [token, selectedChannel.id]);

  const resetMessageData = useCallback(async () => {
    await resetMessageDataAction(dispatch);
  }, []);

  const updateFilters = async (filterName, filterValue, filterType) => {
    await updateFiltersAction(
      filterName,
      filterValue,
      filterType,
      state.filters,
      dispatch
    );
  };

  useEffect(() => {
    const filterMessages = async () => {
      await filterMessagesAction(state.filters, state.messages, dispatch);
    };
    if (state.filters.length) filterMessages();
  }, [state.filters, state.messages]);

  return (
    <MessageContext.Provider
      value={{
        state,
        dispatch,
        getMessageData,
        resetMessageData,
        updateFilters,
      }}
    >
      {props.children}
    </MessageContext.Provider>
  );
};

export default MessageContextProvider;
