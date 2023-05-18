import {
  GET_RELATIONSHIPS,
  GET_RELATIONSHIPS_COMPLETE,
  SEND_FRIEND_REQUEST,
  SEND_FRIEND_REQUEST_COMPLETE,
  REMOVE_FRIEND,
  REMOVE_FRIEND_COMPLETE,
  OPEN_DM_COMPLETE,
  OPEN_DM,
} from "./RelationshipContextConstants";
export const RelationshipReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_RELATIONSHIPS:
    case OPEN_DM:
    case REMOVE_FRIEND:
    case SEND_FRIEND_REQUEST:
      return { ...state, isLoading: true };
    case GET_RELATIONSHIPS_COMPLETE:
      return {
        ...state,
        friends: [...payload],
        isLoading: false,
      };
    case REMOVE_FRIEND_COMPLETE:
      return {
        ...state,
        friends: state.friends.filter((f) => f.user.id !== payload),
      };
    case OPEN_DM_COMPLETE:
    case SEND_FRIEND_REQUEST_COMPLETE:
      return { ...state, isLoading: false };
    default:
      return { ...state, ...payload };
  }
};
