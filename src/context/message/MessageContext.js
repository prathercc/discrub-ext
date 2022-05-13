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
  updateMessage as updateMessageAction,
  setSelected as setSelectedAction,
  deleteMessage as deleteMessageAction,
  setAttachmentMessage as setAttachmentMessageAction,
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
      messages: [], // Message objects
      selectedMessages: [], // Array of id
      filteredMessages: [], // Message objects
      filters: [], // Array of object filters
      fetchedMessageLength: 0, // Current length of fetched messages, used for debugging message fetch progress
      isLoading: null,
      attachmentMessage: null, // The selected message for deleting attachments
    })
  );

  const setAttachmentMessage = async (message) => {
    await setAttachmentMessageAction(message, dispatch);
  };

  const setSelected = async (messageIds) => {
    await setSelectedAction(messageIds, dispatch);
  };

  const updateMessage = async (message) => {
    const response = await updateMessageAction(
      message,
      selectedChannel.id,
      token,
      dispatch
    );
    return response;
  };

  const deleteMessage = async (message) => {
    const response = await deleteMessageAction(
      message,
      selectedChannel.id,
      token,
      dispatch
    );
    return response;
  };

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
        updateMessage,
        setSelected,
        deleteMessage,
        setAttachmentMessage,
      }}
    >
      {props.children}
    </MessageContext.Provider>
  );
};

export default MessageContextProvider;
