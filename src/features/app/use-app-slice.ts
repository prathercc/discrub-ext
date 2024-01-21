import { RootState } from "../../app/store";
import {
  setDiscrubPaused as setDiscrubPausedAction,
  setDiscrubCancelled as setDiscrubCancelledAction,
  setIsModifying as setIsModifyingAction,
  setModifyEntity as setModifyEntityAction,
  setModifyStatusText as setModifyStatusTextAction,
  resetModifyStatusText as resetModifyStatusTextAction,
  resetModify as resetModifyAction,
  checkDiscrubPaused as checkDiscrubPausedAction,
  setTimeoutMessage as setTimeoutMessageAction,
} from "./app-slice";
import { Modify } from "./app-types";
import Message from "../../classes/message";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

const useAppSlice = () => {
  const dispatch = useAppDispatch();

  const useDiscrubCancelled = (): boolean =>
    useAppSelector((state: RootState) => state.app.discrubCancelled);

  const useDiscrubPaused = (): boolean =>
    useAppSelector((state: RootState) => state.app.discrubPaused);

  const useModify = (): Modify =>
    useAppSelector((state: RootState) => state.app.modify);

  const state = {
    discrubCancelled: useDiscrubCancelled,
    discrubPaused: useDiscrubPaused,
    modify: useModify,
  };

  const setDiscrubPaused = (value: boolean): void => {
    dispatch(setDiscrubPausedAction(value));
  };

  const setDiscrubCancelled = (value: boolean): void => {
    dispatch(setDiscrubCancelledAction(value));
  };

  const setIsModifying = (value: boolean): void => {
    dispatch(setIsModifyingAction(value));
  };

  const setModifyEntity = (value: Message): void => {
    dispatch(setModifyEntityAction(value));
  };

  const setModifyStatusText = (value: string): void => {
    dispatch(setModifyStatusTextAction(value));
  };

  const resetModifyStatusText = (): void => {
    dispatch(resetModifyStatusTextAction());
  };
  const resetModify = (): void => {
    dispatch(resetModifyAction());
  };

  const checkDiscrubPaused = async (): Promise<void> => {
    await dispatch(checkDiscrubPausedAction());
  };

  /**
   *
   * @param {String} message Message content
   * @param {Number} timeout Number of seconds before message times out
   * @returns
   */
  const setTimeoutMessage = async (
    message: string,
    timeout: number
  ): Promise<void> => {
    await dispatch(setTimeoutMessageAction({ message, timeout }));
  };

  return {
    state,
    setDiscrubPaused,
    setDiscrubCancelled,
    setIsModifying,
    setModifyEntity,
    setModifyStatusText,
    resetModifyStatusText,
    resetModify,
    checkDiscrubPaused,
    setTimeoutMessage,
  };
};

export { useAppSlice };
