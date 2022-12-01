import {
  GET_DMS,
  GET_DMS_COMPLETE,
  SET_DM,
  RESET_DM_COMPLETE,
  SET_PREFILTER_USERID,
} from "./DmContextConstants";
export const DmReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_DMS:
      return { ...state, isLoading: true };
    case GET_DMS_COMPLETE:
      return {
        ...state,
        dms: [
          ...payload.map((dm) => ({
            ...dm,
            name:
              dm.recipients.length === 1
                ? dm.recipients[0].username
                : dm.name
                ? `Group Chat - ${dm.name}`
                : `Unnamed Group Chat - ${dm.id}`,
          })),
        ],
        isLoading: false,
      };
    case SET_DM:
      const selectedDm = state.dms.find((dm) => dm.id === payload.id);
      const preFilterIds = [
        { name: payload.user.name, id: payload.user.id },
        selectedDm.recipients.map((x) => ({
          name: x.username,
          id: x.id,
        })),
      ];
      return {
        ...state,
        selectedDm: selectedDm,
        preFilterUserIds: preFilterIds.flat(),
        preFilterUserId: null,
      };
    case SET_PREFILTER_USERID:
      return { ...state, preFilterUserId: payload.userId };
    case RESET_DM_COMPLETE:
      return {
        ...state,
        selectedDm: {
          id: null,
          name: null,
          type: null,
          owner_id: null,
        },
        preFilterUserId: null,
        preFilterUserIds: [],
      };
    default:
      return { ...state, ...payload };
  }
};
