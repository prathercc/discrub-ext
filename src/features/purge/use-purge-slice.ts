import { RootState } from "../../app/store";
import {
  setIsLoading as setIsLoadingAction,
  purge as purgeAction,
} from "./purge-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Channel from "../../classes/channel";

const usePurgeSlice = () => {
  const dispatch = useAppDispatch();

  const useIsLoading = (): boolean | Maybe =>
    useAppSelector((state: RootState) => state.purge.isLoading);

  const usePurgeChannel = (): Channel | null =>
    useAppSelector((state: RootState) => state.purge.purgeChannel);

  const state = {
    isLoading: useIsLoading,
    purgeChannel: usePurgeChannel,
  };

  const setIsLoading = (value: boolean): void => {
    dispatch(setIsLoadingAction(value));
  };

  /**
   * Iterates through the provided array and deletes every message from each Channel.
   */
  const purge = (channels: Channel[]) => {
    dispatch(purgeAction(channels));
  };

  return {
    state,
    setIsLoading,
    purge,
  };
};

export { usePurgeSlice };
