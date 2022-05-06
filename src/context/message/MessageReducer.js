import {
  GET_MESSAGE_DATA,
  GET_MESSAGE_DATA_COMPLETE,
  UPDATE_FETCHED_MESSAGES,
  RESET_MESSAGE_DATA_COMPLETE,
} from "./MessageContextConstants";
export const MessageReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
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
    case UPDATE_FETCHED_MESSAGES:
    default:
      return { ...state, ...payload };
  }
};
