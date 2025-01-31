import { createSlice } from "@reduxjs/toolkit";
import { deleteRawMessage, retrieveMessages } from "../message/message-slice";
import { liftThreadRestrictions } from "../thread/thread-slice";
import {
  isAppStopped,
  resetModify,
  setDiscrubCancelled,
  setIsModifying,
  setModifyEntity,
} from "../app/app-slice";
import { PurgeState, PurgeStatus } from "./purge-types";
import { AppThunk } from "../../app/store";
import Channel from "../../classes/channel";
import Message from "../../classes/message";
import { isRemovableMessage, isSearchComplete } from "../../utils";
import Guild from "../../classes/guild.ts";
import { isGuild } from "../../app/guards.ts";
import { MessageData, SearchResultData } from "../message/message-types.ts";
import { OFFSET_INCREMENT, START_OFFSET } from "../message/contants.ts";

const initialState: PurgeState = {
  isLoading: null,
};

export const purgeSlice = createSlice({
  name: "purge",
  initialState: initialState,
  reducers: {
    setIsLoading: (state, { payload }: { payload: boolean }): void => {
      state.isLoading = payload;
    },
  },
});

export const { setIsLoading } = purgeSlice.actions;

/**
 * Purge messages from an array of DMs or Guilds.
 * @param entities
 */
export const purge =
  (entities: Channel[] | Guild[]): AppThunk =>
  async (dispatch, getState) => {
    const { searchCriteria } = getState().message;

    dispatch(setIsModifying(true));
    for (const entity of entities) {
      if (await dispatch(isAppStopped())) break;
      let payload: MessageData & Partial<SearchResultData> = {
        messages: [],
        threads: [],
        totalMessages: 0,
        offset: START_OFFSET,
        searchCriteria: searchCriteria,
      };

      const guildId = isGuild(entity) ? entity.id : null;
      const channelId = isGuild(entity) ? null : entity.id;

      let isResetPurge = false;
      let skipThreadIds: string[] = [];
      const trackedMessageIds: string[] = [];

      do {
        const offset = payload.offset || START_OFFSET;
        if (offset === START_OFFSET) isResetPurge = true;

        const options = {
          excludeReactions: true,
          excludeUserLookups: true,
          startOffSet: offset,
          endOffSet: offset + OFFSET_INCREMENT,
          searchCriteriaOverrides: { ...(payload.searchCriteria || {}) },
        };

        payload = await dispatch(retrieveMessages(guildId, channelId, options));

        payload.messages.forEach((m) => {
          if (!trackedMessageIds.some((id) => id === m.id)) {
            trackedMessageIds.push(m.id);
            isResetPurge = false; // Unique Messages still exist
          }
        });

        // We have restarted twice without seeing a unique message, Purge is complete.
        if (payload.offset === START_OFFSET && isResetPurge) break;

        await dispatch(
          _purgeMessages(payload.messages, payload.threads, skipThreadIds, {
            totalMessages: payload.totalMessages,
          }),
        );
      } while (!isSearchComplete(payload.offset, payload.totalMessages));
    }
    dispatch(resetModify());
    dispatch(setDiscrubCancelled(false));
  };

export const _purgeMessages =
  (
    messages: Message[],
    threads: Channel[],
    skipThreadIds: string[],
    { totalMessages }: Partial<SearchResultData> = {},
  ): AppThunk<Promise<void>> =>
  async (dispatch, _getState) => {
    for (const [index, message] of messages.entries()) {
      if (await dispatch(isAppStopped())) break;

      skipThreadIds = await dispatch(
        liftThreadRestrictions(message.channel_id, skipThreadIds, threads),
      );

      let modifyEntity = Object.assign(new Message({ ...message }), {
        _index: index + 1,
        _total: Number(totalMessages) - index,
        _status: PurgeStatus.IN_PROGRESS,
      });

      dispatch(setModifyEntity(modifyEntity));

      const isMissingPermission = skipThreadIds.some(
        (id) => id === message.channel_id,
      );
      if (isMissingPermission) {
        modifyEntity._status = PurgeStatus.MISSING_PERMISSION;
      } else if (isRemovableMessage(message)) {
        const success = await dispatch(deleteRawMessage(message));
        modifyEntity._status = success
          ? PurgeStatus.REMOVED
          : PurgeStatus.MISSING_PERMISSION;
      }
      dispatch(setModifyEntity(modifyEntity));
    }
  };

export default purgeSlice.reducer;
