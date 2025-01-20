import { RootState } from "../../app/store";
import {
  setIsLoading as setIsLoadingAction,
  setDms as setDmsAction,
  resetDm as resetDmAction,
  getDms as getDmsAction,
  mutateSelectedDms as mutateSelectedDmsAction,
} from "./dm-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { PreFilterUser } from "./dm-types";
import Channel from "../../classes/channel";

const useDmSlice = () => {
  const dispatch = useAppDispatch();

  const useDms = (): Channel[] =>
    useAppSelector((state: RootState) => state.dm.dms);

  const useSelectedDms = (): Channel[] =>
    useAppSelector((state: RootState) => state.dm.selectedDms);

  const useIsLoading = (): boolean | Maybe =>
    useAppSelector((state: RootState) => state.dm.isLoading);

  const usePreFilterUsers = (): PreFilterUser[] =>
    useAppSelector((state: RootState) => state.dm.preFilterUsers);

  const state = {
    dms: useDms,
    selectedDms: useSelectedDms,
    isLoading: useIsLoading,
    preFilterUsers: usePreFilterUsers,
  };

  const setIsLoading = (value: boolean): void => {
    dispatch(setIsLoadingAction(value));
  };

  const setDms = (dms: Channel[]): void => {
    dispatch(setDmsAction(dms));
  };

  const resetDm = () => {
    dispatch(resetDmAction());
  };

  const getDms = () => {
    dispatch(getDmsAction());
  };

  const setSelectedDms = (dmIds: Snowflake[]) => {
    dispatch(mutateSelectedDmsAction(dmIds));
  };

  return {
    state,
    setIsLoading,
    setDms,
    resetDm,
    getDms,
    setSelectedDms,
  };
};

export { useDmSlice };
