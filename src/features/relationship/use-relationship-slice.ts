import { RootState } from "../../app/store";
import {
  setIsLoading as setIsLoadingAction,
  setFriends as setFriendsAction,
  getFriends as getFriendsAction,
  addFriend as addFriendAction,
  deleteFriend as deleteFriendAction,
  openDm as openDmAction,
} from "./relationship-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

const useRelationshipSlice = () => {
  const dispatch = useAppDispatch();

  const useIsLoading = (): boolean | Maybe =>
    useAppSelector((state: RootState) => state.relationship.isLoading);

  const useFriends = (): unknown[] =>
    useAppSelector((state: RootState) => state.relationship.friends);

  const state = {
    isLoading: useIsLoading,
    friends: useFriends,
  };

  const setIsLoading = (value: boolean): void => {
    dispatch(setIsLoadingAction(value));
  };

  const setFriends = (friends: unknown[]) => {
    dispatch(setFriendsAction(friends));
  };

  const getFriends = () => {
    dispatch(getFriendsAction());
  };

  const addFriend = (username: string, discriminator: string) => {
    dispatch(addFriendAction({ username, discriminator }));
  };

  const deleteFriend = (userId: Snowflake) => {
    dispatch(deleteFriendAction(userId));
  };

  const openDm = (userId: Snowflake) => {
    dispatch(openDmAction(userId));
  };

  return {
    state,
    setIsLoading,
    setFriends,
    getFriends,
    addFriend,
    deleteFriend,
    openDm,
  };
};

export { useRelationshipSlice };
