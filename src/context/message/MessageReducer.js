import {
  GET_MESSAGE_DATA,
  GET_MESSAGE_DATA_COMPLETE,
  UPDATE_FETCHED_MESSAGES,
  RESET_MESSAGE_DATA_COMPLETE,
  FILTER_MESSAGE,
  FILTER_MESSAGE_COMPLETE,
  UPDATE_FILTERS_COMPLETE,
} from "./MessageContextConstants";
export const MessageReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case FILTER_MESSAGE:
    case GET_MESSAGE_DATA:
      return { ...state, isLoading: true };
    case GET_MESSAGE_DATA_COMPLETE:
      return {
        ...state,
        ...payload,
        isLoading: false,
        fetchedMessageLength: 0,
      };
    case RESET_MESSAGE_DATA_COMPLETE:
      return {
        ...state,
        messages: [],
        selectedMessages: [],
        fetchedMessageLength: 0,
        isLoading: null,
      };
    case FILTER_MESSAGE_COMPLETE:
      return { ...state, filteredMessages: payload, isLoading: false };
    case UPDATE_FILTERS_COMPLETE:
      return { ...state, filters: payload };
    case UPDATE_FETCHED_MESSAGES:
    default:
      return { ...state, ...payload };
  }
};
