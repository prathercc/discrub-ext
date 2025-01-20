import { createSlice } from "@reduxjs/toolkit";
import { resetFilters, resetMessageData } from "../message/message-slice";
import Channel from "../../classes/channel";
import { DmState, PreFilterUser, SetSelectedDmsProps } from "./dm-types";
import { AppThunk } from "../../app/store";
import DiscordService from "../../services/discord-service";

const initialState: DmState = {
  dms: [],
  selectedDms: [],
  isLoading: null,
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
        Object.assign(dm, { name: _getDmName(dm) }),
      );
    },
    resetDm: (state): void => {
      state.preFilterUsers = [];
      state.selectedDms = [];
    },
    setSelectedDms: (
      state,
      { payload }: { payload: SetSelectedDmsProps },
    ): void => {
      const { dmIds, preFilterUser } = payload;
      const selectedDms = state.dms.filter((dm) =>
        dmIds.some((id) => id === dm.id),
      );

      state.selectedDms = selectedDms;

      let recipients: PreFilterUser[] = [];
      selectedDms.forEach((dm) => {
        if (dm.recipients?.length) {
          recipients = [
            ...recipients,
            ...dm.recipients.map((r) => ({ name: r.username, id: r.id })),
          ];
        }
      });

      state.preFilterUsers = [...recipients, preFilterUser].filter(
        (r) => !state.preFilterUsers.some((p) => p.id === r.id),
      );
    },
  },
});

export const { setIsLoading, setDms, resetDm, setSelectedDms } =
  dmSlice.actions;

export const getDms = (): AppThunk => async (dispatch, getState) => {
  const { settings } = getState().app;
  const { token } = getState().user;
  if (token) {
    dispatch(setIsLoading(true));
    const { success, data } = await new DiscordService(
      settings,
    ).fetchDirectMessages(token);
    if (success && data) {
      dispatch(setDms(data));
      dispatch(setIsLoading(false));
    }
  }
};

export const mutateSelectedDms =
  (dmIds: Snowflake[]): AppThunk =>
  (dispatch, getState) => {
    const { currentUser } = getState().user;
    if (currentUser) {
      dispatch(resetMessageData());
      dispatch(resetFilters());
      dispatch(
        setSelectedDms({
          preFilterUser: { name: currentUser.username, id: currentUser.id },
          dmIds,
        }),
      );
    }
  };

const _getDmName = (dm: Channel) => {
  const { recipients, name, id } = dm;
  return recipients?.length === 1
    ? recipients[0].username
    : `${name ? "" : "Unnamed "}Group Chat - ${name || id}`;
};

export default dmSlice.reducer;
