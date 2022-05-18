import {
  GET_DMS,
  GET_DMS_COMPLETE,
  SET_DM,
  RESET_DM_COMPLETE,
} from "./DmContextConstants";
export const DmReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_DMS:
      return { ...state, isLoading: true };
    case GET_DMS_COMPLETE:
      return { ...state, dms: [...payload], isLoading: false };
    case SET_DM:
      const selectedDm = state.dms.find((dm) => dm.id === payload.id);
      return { ...state, selectedDm: selectedDm };
    case RESET_DM_COMPLETE:
      return {
        ...state,
        selectedDm: {
          id: null,
          name: null,
          type: null,
          owner_id: null,
        },
      };
    default:
      return { ...state, ...payload };
  }
};
