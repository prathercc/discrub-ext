import { createSlice } from "@reduxjs/toolkit";
import { sendChromeMessage } from "../../services/chrome-service";
import { UserState } from "./user-types";
import { AppThunk } from "../../app/store";
import { User } from "../../classes/user";
import DiscordService from "../../services/discord-service";
import { setExportUserMap } from "../export/export-slice.tsx";
import { getPreFilterUsers } from "../guild/guild-slice.ts";
import {
  defaultGMOMappingData,
  getGMOMappingData,
  getUserMappingData,
} from "../../utils.ts";

const initialState: UserState = {
  currentUser: null,
  token: null,
  isLoading: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setIsLoading: (state, { payload }: { payload: boolean }): void => {
      state.isLoading = payload;
    },
    setToken: (state, { payload }: { payload: string | Maybe }): void => {
      state.token = payload;
    },
    setCurrentUser: (state, { payload }: { payload: User }): void => {
      state.currentUser = payload;
    },
  },
});

export const { setIsLoading, setToken, setCurrentUser } = userSlice.actions;

export const getUserData = (): AppThunk => async (dispatch, getState) => {
  const { settings } = getState().app;
  dispatch(setIsLoading(true));
  const chromeCallback = async (userToken: string) => {
    if (userToken) {
      const { success, data } = await new DiscordService(
        settings,
      ).fetchUserData(userToken);
      if (success && data) {
        dispatch(setCurrentUser(data));
        dispatch(setToken(userToken));
      }
    }
    dispatch(setIsLoading(false));
  };
  return sendChromeMessage("GET_TOKEN", chromeCallback);
};

export const getUserDataManaully =
  (userToken: string): AppThunk<Promise<boolean>> =>
  async (dispatch, getState) => {
    const { settings } = getState().app;
    if (userToken) {
      const { data, success } = await new DiscordService(
        settings,
      ).fetchUserData(userToken);

      if (success && data) {
        dispatch(setToken(userToken));
        dispatch(setCurrentUser(data));
        return true;
      } else {
        dispatch(setToken(undefined));
        dispatch(setIsLoading(false));
        return false;
      }
    }
    return false;
  };

export const clearUserMapping =
  (userId: string): AppThunk =>
  (dispatch, getState) => {
    // Remove specified User from map
    const { userMap } = getState().export.exportMaps;
    const newUserMap = { ...userMap };
    delete newUserMap[userId];
    dispatch(setExportUserMap(newUserMap));

    // Refresh Guild Users
    const { selectedGuild } = getState().guild;
    if (selectedGuild) {
      dispatch(getPreFilterUsers(selectedGuild.id));
    }
  };

export const createUserMapping =
  (userId: string, guildId: string): AppThunk =>
  async (dispatch, getState) => {
    const { token } = getState().user;
    if (!token) return;

    const { userMap } = getState().export.exportMaps;
    const newUserMap = { ...userMap };

    // Lookup User and create mapping if one does not exist
    if (!newUserMap[userId]) {
      const { success, data } = await new DiscordService().getUser(
        token,
        userId,
      );
      if (success && data) {
        newUserMap[userId] = { ...getUserMappingData(data), guilds: {} };
      }
    }

    // Lookup Guild Data and update mapping if User mapping exists but Guild data does not
    if (newUserMap[userId] && !newUserMap[userId].guilds[guildId]) {
      const { success, data } = await new DiscordService().fetchGuildUser(
        guildId,
        userId,
        token,
      );
      if (success && data) {
        newUserMap[userId].guilds[guildId] = { ...getGMOMappingData(data) };
      } else {
        newUserMap[userId].guilds[guildId] = { ...defaultGMOMappingData };
      }
    }

    // Add specified User to map
    dispatch(setExportUserMap(newUserMap));

    // Refresh Guild Users
    dispatch(getPreFilterUsers(guildId));
  };

export default userSlice.reducer;
