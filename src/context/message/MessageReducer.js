import {
  GET_MESSAGE_DATA,
  GET_MESSAGE_DATA_COMPLETE,
  UPDATE_FETCHED_MESSAGES,
  RESET_MESSAGE_DATA_COMPLETE,
  FILTER_MESSAGE,
  FILTER_MESSAGE_COMPLETE,
  UPDATE_FILTERS_COMPLETE,
  UPDATE_MESSAGE_SUCCESS,
  SET_SELECTED,
  DELETE_MESSAGE_SUCCESS,
  SET_ATTACHMENT_MESSAGE_COMPLETE,
  RESET_FILTERS_COMPLETE,
  SET_EMBED_MESSAGE_COMPLETE,
  SET_ORDER,
  SET_SEARCH_AFTER_DATE_COMPLETE,
  SET_SEARCH_BEFORE_DATE_COMPLETE,
  SET_SEARCH_MESSAGE_CONTENT_COMPLETE,
  SET_SELECTED_HAS_TYPES_COMPLETE,
} from "./MessageContextConstants";
export const MessageReducer = (state, action) => {
  const { type, payload } = action;
  const _descendingComparator = (a, b, orderBy) => {
    return b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0;
  };
  switch (type) {
    case SET_ORDER:
      return {
        ...state,
        ...payload,
        messages: state.messages.sort(
          payload.order === "desc"
            ? (a, b) => _descendingComparator(a, b, payload.orderBy)
            : (a, b) => -_descendingComparator(a, b, payload.orderBy)
        ),
        filteredMessages: state.filteredMessages.sort(
          payload.order === "desc"
            ? (a, b) => _descendingComparator(a, b, payload.orderBy)
            : (a, b) => -_descendingComparator(a, b, payload.orderBy)
        ),
      };
    case SET_SELECTED_HAS_TYPES_COMPLETE:
      return { ...state, selectedHasTypes: payload };
    case SET_SEARCH_MESSAGE_CONTENT_COMPLETE:
      return {
        ...state,
        searchMessageContent: payload,
      };
    case SET_SEARCH_AFTER_DATE_COMPLETE:
      return {
        ...state,
        searchAfterDate: payload,
      };
    case SET_SEARCH_BEFORE_DATE_COMPLETE:
      return {
        ...state,
        searchBeforeDate: payload,
      };
    case SET_ATTACHMENT_MESSAGE_COMPLETE:
      return { ...state, attachmentMessage: payload };
    case SET_EMBED_MESSAGE_COMPLETE:
      return { ...state, embedMessage: payload };
    case FILTER_MESSAGE:
    case GET_MESSAGE_DATA:
      return { ...state, isLoading: true };
    case GET_MESSAGE_DATA_COMPLETE:
      return {
        ...state,
        ...payload,
        isLoading: false,
        fetchedMessageLength: 0,
        totalSearchMessages: 0,
      };
    case RESET_MESSAGE_DATA_COMPLETE:
      return {
        ...state,
        messages: [],
        selectedMessages: [],
        fetchedMessageLength: 0,
        totalSearchMessages: 0,
        isLoading: null,
        threads: [],
      };
    case RESET_FILTERS_COMPLETE:
      return { ...state, filters: [], filteredMessages: [] };
    case FILTER_MESSAGE_COMPLETE:
      return {
        ...state,
        filteredMessages: payload,
        isLoading: false,
        selectedMessages: payload
          .filter((message) =>
            state.selectedMessages.some((messageId) => message.id === messageId)
          )
          .map((message) => message.id),
      };
    case UPDATE_FILTERS_COMPLETE:
      return { ...state, filters: payload };
    case UPDATE_MESSAGE_SUCCESS:
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === payload.id
            ? { ...payload, username: message.username }
            : { ...message }
        ),
        filteredMessages: state.filteredMessages.map((message) =>
          message.id === payload.id
            ? { ...payload, username: message.username }
            : { ...message }
        ),
        attachmentMessage:
          state.attachmentMessage?.id === payload.id
            ? { ...payload, username: state.attachmentMessage.username }
            : state.attachmentMessage,
      };
    case DELETE_MESSAGE_SUCCESS:
      return {
        ...state,
        messages: state.messages.filter((message) => message.id !== payload.id),
        filteredMessages: state.filteredMessages.filter(
          (message) => message.id !== payload.id
        ),
        selectedMessages: state.selectedMessages.filter(
          (messageId) => messageId !== payload.id
        ),
      };
    case SET_SELECTED:
      return {
        ...state,
        selectedMessages: [...payload],
      };
    case UPDATE_FETCHED_MESSAGES:
    default:
      return { ...state, ...payload };
  }
};
