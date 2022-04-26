import { GET_USER_DATA, GET_USER_DATA_COMPLETE } from "./UserContextConstants";
export const UserReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_USER_DATA:
      return { ...state, isLoading: true };
    case GET_USER_DATA_COMPLETE:
      return { ...state, ...payload, isLoading: false };
    default:
      return { ...state, ...payload };
  }
};
