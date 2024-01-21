import { RootState } from "../../app/store";
import {
  setIsLoading as setIsLoadingAction,
  setDms as setDmsAction,
  setDm as setDmAction,
  resetDm as resetDmAction,
  setPreFilterUserId as setPreFilterUserIdAction,
  getDms as getDmsAction,
  changeDm as changeDmAction,
} from "./dm-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { PreFilterUser } from "./dm-types";
import Channel from "../../classes/channel";

const useDmSlice = () => {
  const dispatch = useAppDispatch();

  const useDms = (): Channel[] =>
    useAppSelector((state: RootState) => state.dm.dms);

  const useSelectedDm = (): Channel | Maybe =>
    useAppSelector((state: RootState) => state.dm.selectedDm);

  const useIsLoading = (): boolean | Maybe =>
    useAppSelector((state: RootState) => state.dm.isLoading);

  const usePreFilterUserId = (): Snowflake | Maybe =>
    useAppSelector((state: RootState) => state.dm.preFilterUserId);

  const usePreFilterUsers = (): PreFilterUser[] =>
    useAppSelector((state: RootState) => state.dm.preFilterUsers);

  const state = {
    dms: useDms,
    selectedDm: useSelectedDm,
    isLoading: useIsLoading,
    preFilterUserId: usePreFilterUserId,
    preFilterUsers: usePreFilterUsers,
  };

  const setIsLoading = (value: boolean): void => {
    dispatch(setIsLoadingAction(value));
  };

  const setDms = (dms: Channel[]): void => {
    dispatch(setDmsAction(dms));
  };

  const setDm = (dmId: Snowflake, preFilterUser: PreFilterUser) => {
    dispatch(setDmAction({ dmId, preFilterUser }));
  };

  const resetDm = () => {
    dispatch(resetDmAction());
  };

  const setPreFilterUserId = (userId: Snowflake | Maybe) => {
    dispatch(setPreFilterUserIdAction(userId));
  };

  const getDms = () => {
    dispatch(getDmsAction());
  };

  const changeDm = (dmId: Snowflake) => {
    dispatch(changeDmAction(dmId));
  };

  return {
    state,
    setIsLoading,
    setDms,
    setDm,
    resetDm,
    setPreFilterUserId,
    getDms,
    changeDm,
  };
};

export { useDmSlice };
