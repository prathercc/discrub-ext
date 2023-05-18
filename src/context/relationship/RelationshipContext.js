import React, { createContext, useReducer, useContext } from "react";
import { RelationshipReducer } from "./RelationshipReducer";
import { UserContext } from "../user/UserContext";
import {
  GET_RELATIONSHIPS,
  GET_RELATIONSHIPS_COMPLETE,
  SEND_FRIEND_REQUEST_COMPLETE,
  SEND_FRIEND_REQUEST,
  REMOVE_FRIEND_COMPLETE,
  REMOVE_FRIEND,
  OPEN_DM_COMPLETE,
  OPEN_DM,
} from "./RelationshipContextConstants";
import {
  getRelationships,
  sendFriendRequest,
  deleteFriendRequest,
  createDm,
} from "../../discordService";

export const RelationshipContext = createContext();

const RelationshipContextProvider = (props) => {
  const { state: userState } = useContext(UserContext);

  const { token, id: userId, username } = userState;

  const [state, dispatch] = useReducer(
    RelationshipReducer,
    Object.freeze({
      isLoading: null,
      friends: [],
    })
  );

  const getFriends = async () => {
    if (token) {
      dispatch({ type: GET_RELATIONSHIPS });
      const data = await getRelationships(token);
      return dispatch({
        type: GET_RELATIONSHIPS_COMPLETE,
        payload: [...data],
      });
    }
  };

  const addFriend = async (username, discriminator) => {
    if (token) {
      dispatch({ type: SEND_FRIEND_REQUEST });
      const data = await sendFriendRequest(token, { username, discriminator });
      return dispatch({
        type: SEND_FRIEND_REQUEST_COMPLETE,
      });
    }
  };

  const deleteFriend = async (userId) => {
    if (token) {
      dispatch({ type: REMOVE_FRIEND });
      const data = await deleteFriendRequest(token, userId);
      return dispatch({ type: REMOVE_FRIEND_COMPLETE, payload: userId });
    }
  };

  const openDM = async (userId) => {
    if (token) {
      dispatch({ type: OPEN_DM });
      const data = await createDm(token, userId);
      return dispatch({ type: OPEN_DM_COMPLETE });
    }
  };

  return (
    <RelationshipContext.Provider
      value={{
        state,
        dispatch,
        getFriends,
        addFriend,
        deleteFriend,
        openDM,
      }}
    >
      {props.children}
    </RelationshipContext.Provider>
  );
};

export default RelationshipContextProvider;
