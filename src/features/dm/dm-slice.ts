import { createSlice } from "@reduxjs/toolkit";
import { fetchDirectMessages } from "../../services/discord-service";
import {
  resetAdvancedFilters,
  resetFilters,
  resetMessageData,
} from "../message/message-slice";
import Channel from "../../classes/channel";
import { DmState, SetDmProps } from "./dm-types";
import { AppThunk } from "../../app/store";

const initialState: DmState = {
  dms: [],
  selectedDm: null,
  isLoading: null,
  preFilterUserId: null,
  preFilterUsers: [],
};

export const dmSlice = createSlice({
  name: "dm",
  initialState: initialState,
  reducers: {
    setIsLoading: (state, { payload }: { payload: boolean }): void => {
      state.isLoading = payload;
    },
    setDms: (state, { payload }: { payload: Channel[] }): void => {
      state.dms = payload.map((dm) =>
        Object.assign(dm, { name: _getDmName(dm) })
      );
    },
    setDm: (state, { payload }: { payload: SetDmProps }): void => {
      const { dmId, preFilterUser } = payload;
      const selectedDm = state.dms.find((dm) => dm.id === dmId);
      if (selectedDm) {
        state.selectedDm = selectedDm;
        if (selectedDm.recipients) {
          state.preFilterUsers = [
            ...selectedDm.recipients.map((recipient) => ({
              name: recipient.username,
              id: recipient.id,
            })),
            preFilterUser,
          ];
        }
        state.preFilterUserId = null;
      }
    },
    resetDm: (state): void => {
      state.selectedDm = null;
      state.preFilterUserId = null;
      state.preFilterUsers = [];
    },
    setPreFilterUserId: (
      state,
      { payload }: { payload: Snowflake | Maybe }
    ): void => {
      state.preFilterUserId = payload;
    },
  },
});

export const { setIsLoading, setDms, setDm, resetDm, setPreFilterUserId } =
  dmSlice.actions;

export const getDms = (): AppThunk => async (dispatch, getState) => {
  const { token } = getState().user;
  if (token) {
    dispatch(setIsLoading(true));
    const { success, data } = await fetchDirectMessages(token);
    if (success && data) {
      dispatch(setDms(data));
      dispatch(setIsLoading(false));
    }
  }
};

export const changeDm =
  (dmId: Snowflake): AppThunk =>
  (dispatch, getState) => {
    const { currentUser } = getState().user;
    if (currentUser) {
      dispatch(setPreFilterUserId(null));
      dispatch(resetMessageData());
      dispatch(resetFilters());
      if (!dmId) {
        dispatch(resetAdvancedFilters());
        dispatch(resetDm());
      } else {
        dispatch(
          setDm({
            preFilterUser: { name: currentUser.username, id: currentUser.id },
            dmId,
          })
        );
      }
    }
  };

const _getDmName = (dm: Channel) => {
  const { recipients, name, id } = dm;
  return recipients?.length === 1
    ? recipients[0].username
    : `${name ? "" : "Unnamed "}Group Chat - ${name || id}`;
};

export default dmSlice.reducer;
