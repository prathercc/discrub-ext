import { createSlice } from "@reduxjs/toolkit";
import { fetchDirectMessages } from "../../services/discordService";
import {
  resetAdvancedFilters,
  resetFilters,
  resetMessageData,
} from "../message/messageSlice";
import Channel from "../../classes/Channel";

export const dmSlice = createSlice({
  name: "dm",
  initialState: {
    dms: [],
    selectedDm: new Channel(),
    isLoading: null,
    preFilterUserId: null,
    preFilterUserIds: [],
  },
  reducers: {
    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setDms: (state, { payload }) => {
      state.dms = payload.map((dm) =>
        Object.assign(dm, { name: _getDmName(dm) })
      );
    },
    setDm: (state, { payload }) => {
      const { id, preFilterUser } = payload;
      const selectedDm = state.dms.find((dm) => dm.id === id);
      if (selectedDm) {
        state.selectedDm = selectedDm;
        state.preFilterUserIds = [
          ...selectedDm.recipients.map((x) => ({
            name: x.username,
            id: x.id,
          })),
          preFilterUser,
        ];
        state.preFilterUserId = null;
      }
    },
    resetDm: (state, { payload }) => {
      state.selectedDm = new Channel();
      state.preFilterUserId = null;
      state.preFilterUserIds = [];
    },
    setPreFilterUserId: (state, { payload }) => {
      state.preFilterUserId = payload;
    },
  },
});

export const { setIsLoading, setDms, setDm, resetDm, setPreFilterUserId } =
  dmSlice.actions;

export const getDms = () => async (dispatch, getState) => {
  try {
    const { token } = getState().user;
    dispatch(setIsLoading(true));
    const data = (await fetchDirectMessages(token)) || [];
    if (data.length) {
      dispatch(setDms(data.map((dm) => new Channel(dm))));
    }
    dispatch(setIsLoading(false));
  } catch (e) {
    console.error("Failed to fetch dms", e);
    dispatch(setIsLoading(false));
    dispatch(setDms([]));
  }
};

export const changeDm = (dmId) => (dispatch, getState) => {
  const { username, id } = getState().user;
  dispatch(setPreFilterUserId(null));
  dispatch(resetMessageData());
  dispatch(resetFilters());
  if (!dmId) {
    dispatch(resetAdvancedFilters());
    dispatch(resetDm());
  } else {
    dispatch(setDm({ preFilterUser: { name: username, id }, id: dmId }));
  }
};

const _getDmName = (dm) => {
  const { recipients, name, id } = dm;
  return recipients.length === 1
    ? recipients[0].username
    : `${name ? "" : "Unnamed "}Group Chat - ${name || id}`;
};

export const selectDm = (state) => state.dm;

export default dmSlice.reducer;
