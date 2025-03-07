import { createSlice } from "@reduxjs/toolkit";
import {
  deleteRawMessage,
  deleteRawReaction,
  retrieveMessages,
  updateRawMessage,
} from "../message/message-slice";
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
import {
  isRemovableMessage,
  isSearchComplete,
  stringToBool,
  stringToTypedArray,
} from "../../utils";
import Guild from "../../classes/guild.ts";
import { isGuild } from "../../app/guards.ts";
import { MessageData, SearchResultData } from "../message/message-types.ts";
import { OFFSET_INCREMENT, START_OFFSET } from "../message/contants.ts";
import { AppTaskStatus } from "../app/app-types.ts";

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
      let trackedTotalMessages = payload.totalMessages;

      do {
        const offset = payload.offset || START_OFFSET;

        // Prepare to end Purge if no new messages are found on next reset
        if (offset === START_OFFSET) isResetPurge = true;
        //

        dispatch(
          setModifyEntity({ _offset: offset, _total: payload.totalMessages }),
        );

        const options = {
          excludeReactions: true,
          excludeUserLookups: true,
          startOffSet: offset,
          endOffSet: offset + OFFSET_INCREMENT,
          searchCriteriaOverrides: { ...(payload.searchCriteria || {}) },
        };

        payload = await dispatch(retrieveMessages(guildId, channelId, options));

        // Check if Discord search total_results has updated
        const isTotalMessagesUpdated =
          trackedTotalMessages !== START_OFFSET &&
          payload.totalMessages !== trackedTotalMessages;
        if (isTotalMessagesUpdated) {
          payload.offset = START_OFFSET; // Since messages have shifted, we should reset the offset
          isResetPurge = false; // Since messages have shifted, Purge should not end
        }
        //

        // Capture the total amount of messages found by the search
        trackedTotalMessages = payload.totalMessages;
        //

        // Message ids where a delete attempt should not occur
        const skipMessageIds = [...trackedMessageIds];
        //

        payload.messages.forEach((m) => {
          if (!trackedMessageIds.some((id) => id === m.id)) {
            trackedMessageIds.push(m.id);
            isResetPurge = false; // Unique Messages still exist, Purge should not end
          }
        });

        // We have restarted twice without seeing a unique message, Purge is complete.
        if (payload.offset === START_OFFSET && isResetPurge) break;
        //

        await dispatch(
          _purgeMessages(
            payload.messages,
            payload.threads,
            skipThreadIds,
            skipMessageIds,
            {
              totalMessages: payload.totalMessages,
            },
          ),
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
    skipMessageIds: string[],
    { totalMessages }: Partial<SearchResultData> = {},
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const filteredMessages = messages.filter(
      (m) => !skipMessageIds.some((id) => id === m.id),
    );
    for (const [index, message] of filteredMessages.entries()) {
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
      } else {
        const { purgeRetainAttachedMedia, purgeReactionRemovalFrom } =
          getState().app.settings;
        const isReactionRemoval = !!purgeReactionRemovalFrom.length;
        const isRetainedAttachment =
          stringToBool(purgeRetainAttachedMedia) &&
          message?.attachments?.length;
        if (isReactionRemoval) {
          await dispatch(_removeMessageReactions(message, modifyEntity));
        } else if (isRetainedAttachment) {
          await dispatch(_retainAttachmentMessage(message, modifyEntity));
        } else if (isRemovableMessage(message)) {
          const success = await dispatch(deleteRawMessage(message));
          modifyEntity._status = success
            ? PurgeStatus.REMOVED
            : PurgeStatus.MISSING_PERMISSION;
        } else {
          modifyEntity._status = PurgeStatus.MESSAGE_NON_REMOVABLE;
        }
      }
      dispatch(setModifyEntity(modifyEntity));
    }
  };

/**
 * Attempt to remove message reactions during Purge
 * @param message
 * @param modifyEntity
 */
export const _removeMessageReactions =
  (
    message: Message,
    modifyEntity: Message & AppTaskStatus,
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { purgeReactionRemovalFrom } = getState().app.settings;
    const unReactUserIds = stringToTypedArray<string>(purgeReactionRemovalFrom);
    const { reactionMap } = getState().export.exportMaps;

    const msgReactionMap = reactionMap[message.id] || {};
    let total = 0;
    let succeeded = 0;
    for (const emoji of Object.keys(msgReactionMap)) {
      const undoReactions = msgReactionMap[emoji].filter((e) =>
        unReactUserIds.some((id) => id === e.id),
      );
      for (const reaction of undoReactions) {
        const success = await dispatch(
          deleteRawReaction(message.channel_id, message.id, emoji, reaction.id),
        );
        total = total + 1;
        if (success) {
          succeeded = succeeded + 1;
        }
      }
    }

    // Result of reaction removal for the provided message
    let status = PurgeStatus.NO_REACTIONS_FOUND;
    if (!!total) {
      if (succeeded === total) {
        status = PurgeStatus.REACTIONS_REMOVED;
      } else if (!!succeeded && succeeded < total) {
        status = PurgeStatus.REACTIONS_PARTIALLY_REMOVED;
      } else if (!succeeded) {
        status = PurgeStatus.MISSING_PERMISSION;
      }
    }
    //

    modifyEntity._status = status;
  };

/**
 * Attempt to retain message attachments during Purge by clearing message text only
 * @param message
 * @param modifyEntity
 */
export const _retainAttachmentMessage =
  (
    message: Message,
    modifyEntity: Message & AppTaskStatus,
  ): AppThunk<Promise<void>> =>
  async (dispatch, _getState) => {
    if (message.content.length) {
      const { success } = await dispatch(
        updateRawMessage(Object.assign(message, { content: "" })),
      );
      modifyEntity._status = success
        ? PurgeStatus.ATTACHMENTS_KEPT
        : PurgeStatus.MISSING_PERMISSION;
    } else {
      modifyEntity._status = PurgeStatus.ATTACHMENTS_KEPT;
    }
  };

export default purgeSlice.reducer;
