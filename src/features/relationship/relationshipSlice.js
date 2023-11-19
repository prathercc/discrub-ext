import { createSlice } from "@reduxjs/toolkit";
import {
  createDm,
  deleteFriendRequest,
  getRelationships,
  sendFriendRequest,
} from "../../services/discordService";

export const relationshipSlice = createSlice({
  name: "relationship",
  initialState: {
    isLoading: null,
    friends: [],
  },
  reducers: {
    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setFriends: (state, { payload }) => {
      state.friends = payload;
    },
  },
});

export const { setIsLoading, setFriends } = relationshipSlice.actions;

export const getFriends = () => async (dispatch, getState) => {
  dispatch(setIsLoading(true));
  const { token } = getState().user;
  const data = (await getRelationships(token)) || [];
  if (data.length) {
    dispatch(setFriends(data));
  }
  dispatch(setIsLoading(false));
};

export const addFriend =
  (username, discriminator) => async (dispatch, getState) => {
    dispatch(setIsLoading(true));
    const { token } = getState().user;
    await sendFriendRequest(token, { username, discriminator });
    dispatch(setIsLoading(false));
  };

export const deleteFriend = (userId) => async (dispatch, getState) => {
  const { token } = getState().user;
  const { friends } = getState().relationship;
  dispatch(setIsLoading(true));
  await deleteFriendRequest(token, userId); // TODO: We need to ensure the delete was successful before actually removing.
  dispatch(setFriends(friends.filter((f) => f.user.id !== userId)));
  dispatch(setIsLoading(false));
};

export const openDm = (userId) => async (dispatch, getState) => {
  const { token } = getState().user;
  dispatch(setIsLoading(true));
  await createDm(token, userId); // TODO: Possibly return a response so User knows if DM was opened successfully.
  dispatch(setIsLoading(false));
};

export default relationshipSlice.reducer;
