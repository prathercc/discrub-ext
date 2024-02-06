import { RootState } from "../../app/store";
import {
  setIsLoading as setIsLoadingAction,
  setToken as setTokenAction,
  setCurrentUser as setCurrentUserAction,
  getUserData as getUserDataAction,
  getUserDataManaully as getUserDataManaullyAction,
} from "./user-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { User } from "../../classes/user";

const useUserSlice = () => {
  const dispatch = useAppDispatch();

  const useCurrentUser = (): User | Maybe =>
    useAppSelector((state: RootState) => state.user.currentUser);

  const useToken = (): string | Maybe =>
    useAppSelector((state: RootState) => state.user.token);

  const useIsLoading = (): boolean | Maybe =>
    useAppSelector((state: RootState) => state.user.isLoading);

  const state = {
    currentUser: useCurrentUser,
    token: useToken,
    isLoading: useIsLoading,
  };

  const setIsLoading = (value: boolean): void => {
    dispatch(setIsLoadingAction(value));
  };

  const setToken = (value: string | Maybe): void => {
    dispatch(setTokenAction(value));
  };

  const setCurrentUser = (value: User): void => {
    dispatch(setCurrentUserAction(value));
  };

  const getUserData = (): void => {
    dispatch(getUserDataAction());
  };

  const getUserDataManaully = async (token: string): Promise<boolean> => {
    return dispatch(getUserDataManaullyAction(token));
  };

  return {
    state,
    setIsLoading,
    setToken,
    setCurrentUser,
    getUserData,
    getUserDataManaully,
  };
};

export { useUserSlice };
