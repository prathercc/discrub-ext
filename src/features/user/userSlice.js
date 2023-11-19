import { createSlice } from "@reduxjs/toolkit";
import { sendChromeMessage } from "../../services/chromeService";
import { fetchUserData } from "../../services/discordService";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    accent_color: null,
    avatar: null,
    avatar_decoration: null,
    banner: null,
    banner_color: null,
    bio: null,
    discriminator: null,
    email: null,
    flags: null,
    id: null,
    locale: null,
    mfa_enabled: null,
    nsfw_allowed: null,
    phone: null,
    pronouns: null,
    public_flags: null,
    token: null,
    username: null,
    verified: null,
    isLoading: null,
  },
  reducers: {
    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setToken: (state, { payload }) => {
      state.token = payload;
    },
    setUserData: (state, { payload }) => {
      state = Object.assign(state, payload);
    },
  },
});

export const { setIsLoading, setToken, setUserData } = userSlice.actions;

export const getUserData = () => async (dispatch) => {
  dispatch(setIsLoading(true));
  const chromeCallback = async (userToken) => {
    try {
      let data = null;
      if (userToken) {
        data = await fetchUserData(userToken);
        if (data) {
          dispatch(setToken(userToken));
          dispatch(setUserData(data));
        }
      }
      dispatch(setIsLoading(false));
    } catch (e) {
      console.error("Failed to authorize", e);
      dispatch(setIsLoading(false));
    }
  };
  return sendChromeMessage("GET_TOKEN", chromeCallback);
};

export const getUserDataManually =
  (userToken) => async (dispatch, getState) => {
    if (userToken) {
      try {
        dispatch(setIsLoading(true));
        const data = await fetchUserData(userToken);

        if (data.code === 0 || data.code || !data) {
          dispatch(setToken(undefined));
          dispatch(setIsLoading(false));
          return { successful: false };
        } else {
          dispatch(setToken(userToken));
          dispatch(setUserData(data));
          dispatch(setIsLoading(false));
          return { successful: true };
        }
      } catch (e) {
        console.error("Failed to authorize by token", e);
        dispatch(setToken(undefined));
        dispatch(setIsLoading(false));
        return { successful: false };
      }
    }
  };

export const selectUser = (state) => state.user;

export default userSlice.reducer;
