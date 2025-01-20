import { createSlice } from "@reduxjs/toolkit";
import {
  resetAdvancedFilters,
  resetFilters,
  resetMessageData,
} from "../message/message-slice";
import Channel from "../../classes/channel";
import { ChannelState } from "./channel-types";
import { AppThunk } from "../../app/store";
import { ChannelType } from "../../enum/channel-type";
import DiscordService from "../../services/discord-service";

const initialState: ChannelState = {
  channels: [],
  selectedChannel: null,
  isLoading: null,
  selectedExportChannels: [], // Array of channel ID's, used for exporting Guild}
};

export const channelSlice = createSlice({
  name: "channel",
  initialState: initialState,
  reducers: {
    setIsLoading: (state, { payload }: { payload: boolean }): void => {
      state.isLoading = payload;
    },
    setChannels: (state, { payload }: { payload: Channel[] }): void => {
      state.channels = payload;
    },
    setChannel: (state, { payload }: { payload: Snowflake | null }): void => {
      const selectedChannel = state.channels.find(
        (channel) => channel.id === payload,
      );
      state.selectedChannel = selectedChannel || null;
    },
    resetChannel: (state): void => {
      state.selectedChannel = null;
    },
    setSelectedExportChannels: (
      state,
      { payload }: { payload: Snowflake[] },
    ): void => {
      state.selectedExportChannels = payload;
    },
  },
});

export const {
  setIsLoading,
  setChannels,
  setChannel,
  resetChannel,
  setSelectedExportChannels,
} = channelSlice.actions;

export const getChannels =
  (guildId: Snowflake): AppThunk =>
  async (dispatch, getState) => {
    const { settings } = getState().app;
    const { token } = getState().user;
    if (guildId && token) {
      dispatch(setIsLoading(true));
      const { success, data } = await new DiscordService(
        settings,
      ).fetchChannels(token, guildId);
      if (success && data) {
        dispatch(
          setChannels(
            data.filter((c) => c.type !== ChannelType.GUILD_CATEGORY),
          ),
        );
      } else {
        dispatch(setChannels([]));
      }
      dispatch(setIsLoading(false));
    }
  };

export const changeChannel =
  (channelId: Snowflake | null): AppThunk =>
  async (dispatch) => {
    if (!channelId) {
      dispatch(resetAdvancedFilters());
    }
    dispatch(resetFilters());
    dispatch(resetMessageData());
    dispatch(setChannel(channelId));
  };

export const loadChannel =
  (channelId: Snowflake): AppThunk =>
  async (dispatch, getState) => {
    const { settings } = getState().app;
    const { selectedGuild } = getState().guild;
    const { token } = getState().user;
    const { channels } = getState().channel;

    if (token && channelId && !channels.map((c) => c.id).includes(channelId)) {
      const { data, success } = await new DiscordService(settings).fetchChannel(
        token,
        channelId,
      );
      if (success && data && data.guild_id === selectedGuild?.id) {
        dispatch(setChannels([...channels, data]));
      }
    }
  };

export default channelSlice.reducer;
