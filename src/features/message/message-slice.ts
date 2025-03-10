import { createSlice } from "@reduxjs/toolkit";
import {
  defaultGMOMappingData,
  getEncodedEmoji,
  getGMOMappingData,
  getSortedMessages,
  getUserMappingData,
  isCriteriaActive,
  isDm,
  isGuildForum,
  isRemovableMessage,
  isSearchComplete,
  isUserDataStale,
  messageTypeEquals,
  stringToBool,
} from "../../utils";
import Message from "../../classes/message";
import { MessageType } from "../../enum/message-type";
import {
  getArchivedThreads,
  getThreadsFromMessages,
  liftThreadRestrictions,
  resetThreads,
  setThreads,
} from "../thread/thread-slice";
import {
  resetModify,
  setDiscrubCancelled,
  setIsModifying,
  setModifyEntity,
  setTimeoutMessage as notify,
  setStatus,
  resetStatus,
  isAppStopped,
} from "../app/app-slice";
import { MessageRegex } from "../../enum/message-regex";
import {
  resetExportMaps,
  setExportReactionMap,
  setExportUserMap,
} from "../export/export-slice";
import { getPreFilterUsers } from "../guild/guild-slice";
import { isDate, parseISO } from "date-fns";
import {
  DeleteConfiguration,
  Filter,
  MessageData,
  MessageSearchOptions,
  MessageState,
  SearchCriteria,
  SearchResultData,
} from "./message-types";
import { SortDirection } from "../../enum/sort-direction";
import { FilterType } from "../../enum/filter-type";
import { FilterName } from "../../enum/filter-name";
import Attachment from "../../classes/attachment";
import { AppThunk } from "../../app/store";
import { isMessage } from "../../app/guards";
import {
  ExportReaction,
  ExportReactionMap,
  ExportUserMap,
} from "../export/export-types";
import Channel from "../../classes/channel";
import { QueryStringParam } from "../../enum/query-string-param";
import { Reaction } from "../../classes/reaction";
import { ReactionType } from "../../enum/reaction-type";
import { MessageCategory } from "../../enum/message-category";
import DiscordService from "../../services/discord-service";
import { IsPinnedType } from "../../enum/is-pinned-type.ts";
import { MAX_OFFSET, OFFSET_INCREMENT, START_OFFSET } from "./contants.ts";

const _descendingComparator = <Message>(
  a: Message,
  b: Message,
  orderBy: keyof Message,
) => {
  return b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0;
};

const initialState: MessageState = {
  messages: [],
  selectedMessages: [],
  filteredMessages: [],
  filters: [],
  isLoading: null,
  order: SortDirection.ASCENDING,
  orderBy: "timestamp",
  searchCriteria: {
    searchBeforeDate: null,
    searchAfterDate: null,
    searchMessageContent: null,
    selectedHasTypes: [],
    userIds: [],
    mentionIds: [],
    channelIds: [],
    isPinned: IsPinnedType.UNSET,
  },
};

export const messageSlice = createSlice({
  name: "message",
  initialState: initialState,
  reducers: {
    setIsLoading: (state, { payload }: { payload: boolean }): void => {
      state.isLoading = payload;
    },
    setSearchCriteria: (
      state,
      { payload }: { payload: Partial<SearchCriteria> },
    ): void => {
      state.searchCriteria = { ...state.searchCriteria, ...payload };
    },
    setSelected: (state, { payload }: { payload: Snowflake[] }): void => {
      state.selectedMessages = payload;
    },
    setOrder: (
      state,
      {
        payload,
      }: { payload: { order: SortDirection; orderBy: keyof Message } },
    ): void => {
      const { order, orderBy } = payload;
      state.order = order;
      state.orderBy = orderBy;
      state.messages = state.messages.sort(
        payload.order === SortDirection.DESCENDING
          ? (a, b) => _descendingComparator(a, b, orderBy)
          : (a, b) => -_descendingComparator(a, b, orderBy),
      );
      state.filteredMessages = state.filteredMessages.sort(
        payload.order === SortDirection.DESCENDING
          ? (a, b) => _descendingComparator(a, b, orderBy)
          : (a, b) => -_descendingComparator(a, b, orderBy),
      );
    },
    setMessages: (state, { payload }: { payload: Message[] }): void => {
      state.messages = payload;
    },
    setFilteredMessages: (state, { payload }: { payload: Message[] }): void => {
      state.filteredMessages = payload;
    },
    _resetMessageData: (state): void => {
      state.messages = [];
      state.selectedMessages = [];
      state.isLoading = null;
    },
    resetFilters: (state): void => {
      state.filters = [];
      state.filteredMessages = [];
    },
    resetAdvancedFilters: (state): void => {
      state.searchCriteria = initialState.searchCriteria;
    },
    updateFilters: (state, { payload }: { payload: Filter }): void => {
      const { filterName, filterValue, filterType } = payload;
      const filteredList = state.filters.filter(
        (x) => x.filterName !== filterName,
      );
      let retFilters: Filter[] = [];
      if (filterType === FilterType.TEXT) {
        if (Number(filterValue?.length) > 0)
          retFilters = [
            ...filteredList,
            {
              filterName: filterName,
              filterValue: filterValue,
              filterType: filterType,
            },
          ];
        else retFilters = [...filteredList];
      } else if (filterType === FilterType.DATE) {
        if (isDate(filterValue) && filterValue.getTime()) {
          retFilters = [
            ...filteredList,
            {
              filterName: filterName,
              filterValue: filterValue,
              filterType: filterType,
            },
          ];
        } else retFilters = [...filteredList];
      } else if (filterType === FilterType.THREAD) {
        if (Number(filterValue?.length) > 0)
          retFilters = [
            ...filteredList.filter((f) => f.filterType !== filterType),
            {
              filterValue: filterValue,
              filterType: filterType,
            },
          ];
        else
          retFilters = [
            ...filteredList.filter((f) => f.filterType !== filterType),
          ];
      } else if (filterType === FilterType.TOGGLE) {
        if (filterValue) {
          // Add the toggle to filters
          retFilters = [
            ...filteredList,
            {
              filterName: filterName,
              filterValue: filterValue,
              filterType: filterType,
            },
          ];
        } else {
          // Remove the toggle from filters
          retFilters = filteredList.filter(
            (filter) => filter.filterName !== filterName,
          );
        }
      } else if (filterType === FilterType.ARRAY) {
        if (filterValue.length) {
          retFilters = [
            ...filteredList.filter((f) => f.filterName !== filterName),
            {
              filterName: filterName,
              filterValue: filterValue,
              filterType: filterType,
            },
          ];
        } else {
          // Remove filter from list
          retFilters = [
            ...filteredList.filter((f) => f.filterName !== filterName),
          ];
        }
      }
      state.filters = retFilters;
    },
  },
});

const _filterMessageType = (
  _filterValue: string[],
  message: Message,
  inverseActive: boolean,
  threads: Channel[],
): boolean => {
  const messageHasType = _filterValue.some((fv) => {
    return (
      messageTypeEquals(message.type, fv as MessageType) ||
      (fv === MessageCategory.PINNED && message.pinned) ||
      (fv === MessageCategory.REACTIONS && !!message.reactions?.length) ||
      (fv === MessageCategory.THREAD &&
        threads.some((t) => t.id === message.channel_id)) ||
      (fv === MessageCategory.THREAD_STARTER && message.thread?.id)
    );
  });
  const criteriaMet =
    (!inverseActive && !messageHasType) || (inverseActive && messageHasType);

  if (criteriaMet) {
    return false;
  }

  return true;
};

const _filterThread = (
  filterValue: Snowflake,
  message: Message,
  inverseActive: boolean,
): boolean => {
  const { channel_id, thread } = message;
  const isFromThread = channel_id === filterValue || thread?.id === filterValue;

  const criteriaMet =
    (!inverseActive && !isFromThread) || (inverseActive && isFromThread);

  if (criteriaMet) {
    return false;
  }

  return true;
};

const _filterEndTime = (
  filterValue: Date,
  message: Message,
  inverseActive: boolean,
): boolean => {
  const endTime = filterValue.getTime();
  const rowTime = Date.parse(message.timestamp);

  const criteriaMet =
    (!inverseActive && rowTime > endTime) ||
    (inverseActive && !(rowTime > endTime));

  if (criteriaMet) {
    return false;
  }

  return true;
};

const _filterStartTime = (
  filterValue: Date,
  message: Message,
  inverseActive: boolean,
): boolean => {
  const startTime = filterValue.getTime();
  const rowTime = Date.parse(message.timestamp);

  const criteriaMet =
    (!inverseActive && rowTime < startTime) ||
    (inverseActive && !(rowTime < startTime));

  if (criteriaMet) {
    return false;
  }

  return true;
};

const _filterText = (
  filterName: keyof Message,
  filterValue: string | string[],
  message: Message,
  inverseActive: boolean,
): boolean => {
  const messagePropertyValue = message[filterName];
  if (typeof messagePropertyValue === "string") {
    const textContainsValue = Array.isArray(filterValue)
      ? filterValue.some((fv) => messagePropertyValue.includes(fv))
      : messagePropertyValue.includes(filterValue);
    const criteriaMet =
      (!inverseActive && !textContainsValue) ||
      (inverseActive && textContainsValue);
    if (criteriaMet) {
      return false;
    }
  }
  return true;
};

const _filterAttachmentName = (
  filterValue: string | string[],
  message: Message,
  inverseActive: boolean,
) => {
  const csvAttachments = message.attachments.map((a) => a.filename).join();
  const attachmentsIncludeValue = Array.isArray(filterValue)
    ? filterValue.some((fv) =>
        csvAttachments.toLowerCase().includes(fv.toLowerCase()),
      )
    : csvAttachments.toLowerCase().includes(filterValue.toLowerCase());

  const criteriaMet =
    (inverseActive && attachmentsIncludeValue) ||
    (!inverseActive && !attachmentsIncludeValue);
  if (criteriaMet) {
    return false;
  }
  return true;
};

const _filterMessageContent = (
  filterValue: string | string[],
  message: Message,
  inverseActive: boolean,
) => {
  const contentContainsValue = Array.isArray(filterValue)
    ? filterValue.some((fv) => message.content.includes(fv))
    : message.content.includes(filterValue);
  const embedsContainValue =
    message.embeds &&
    message.embeds.some((embed) => {
      const { author, description, fields, footer, title, type, url } = embed;
      return (
        type === "rich" &&
        ([
          author?.name,
          author?.url,
          description,
          footer?.text,
          title,
          url,
        ].some((prop) =>
          Array.isArray(filterValue)
            ? filterValue.some((fv) => prop?.includes(fv))
            : prop?.includes(filterValue),
        ) ||
          fields?.some((field) =>
            [field.name, field.value].some((fieldProp) =>
              Array.isArray(filterValue)
                ? filterValue.some((fv) => fieldProp?.includes(fv))
                : fieldProp?.includes(filterValue),
            ),
          ))
      );
    });

  const appliesToMessage = contentContainsValue || embedsContainValue;

  const criteraMet =
    (!inverseActive && !appliesToMessage) ||
    (inverseActive && appliesToMessage);

  if (criteraMet) {
    return false;
  }
  return true;
};

export const {
  setIsLoading,
  setSearchCriteria,
  setSelected,
  setOrder,
  setMessages,
  setFilteredMessages,
  _resetMessageData,
  resetFilters,
  resetAdvancedFilters,
  updateFilters,
} = messageSlice.actions;

export const filterMessages =
  (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const state = getState().message;
    let retArr: Message[] = [];
    const inverseActive = state.filters
      .filter((f) => f.filterName)
      .some((filter) => filter.filterName === FilterName.INVERSE);
    const activeFilterCount = state.filters.length;

    if ((activeFilterCount === 1 && inverseActive) || activeFilterCount === 0) {
      retArr = state.messages;
    } else {
      state.messages.forEach((x) => {
        let criteriaMet = true;
        state.filters.forEach((param) => {
          if (criteriaMet && param.filterValue) {
            if (param.filterType === FilterType.TEXT) {
              if (param.filterName === FilterName.ATTACHMENT_NAME) {
                criteriaMet = _filterAttachmentName(
                  param.filterValue,
                  x,
                  inverseActive,
                );
              } else if (param.filterName === FilterName.CONTENT) {
                criteriaMet = _filterMessageContent(
                  param.filterValue,
                  x,
                  inverseActive,
                );
              } else {
                criteriaMet = _filterText(
                  param.filterName,
                  param.filterValue,
                  x,
                  inverseActive,
                );
              }
              return criteriaMet;
            } else if (param.filterType === FilterType.DATE) {
              if (param.filterName === FilterName.START_TIME) {
                criteriaMet = _filterStartTime(
                  param.filterValue,
                  x,
                  inverseActive,
                );
              } else if (param.filterName === FilterName.END_TIME) {
                criteriaMet = _filterEndTime(
                  param.filterValue,
                  x,
                  inverseActive,
                );
              }
            } else if (param.filterType === FilterType.THREAD) {
              criteriaMet = _filterThread(param.filterValue, x, inverseActive);
            } else if (param.filterType === FilterType.ARRAY) {
              if (param.filterName === FilterName.MESSAGE_TYPE) {
                const { threads } = getState().thread;
                criteriaMet = _filterMessageType(
                  param.filterValue,
                  x,
                  inverseActive,
                  threads,
                );
              }
            }
          }
        });
        if (criteriaMet) retArr.push(x);
      });
    }

    dispatch(setFilteredMessages(retArr));
    dispatch(
      setSelected(
        retArr
          .filter((m) => state.selectedMessages.some((mId) => m.id === mId))
          .map((m) => m.id),
      ),
    );
  };

/**
 * Delete a reaction without changing message state
 * @param channelId
 * @param messageId
 * @param emoji
 * @param userId
 */
export const deleteRawReaction =
  (
    channelId: string,
    messageId: string,
    emoji: string,
    userId: string,
  ): AppThunk<Promise<boolean>> =>
  async (dispatch, getState) => {
    const { settings } = getState().app;
    const { token, currentUser } = getState().user;
    const { reactionMap } = getState().export.exportMaps;
    let success = false;

    if (token) {
      ({ success } = await new DiscordService(settings).deleteReaction(
        token,
        channelId,
        messageId,
        emoji,
        userId === currentUser?.id ? "@me" : userId,
      ));
      if (success) {
        const updatedReactionMap = {
          ...reactionMap,
          [messageId]: {
            ...reactionMap[messageId],
            [emoji]: reactionMap[messageId][emoji].filter(
              (er) => er.id !== currentUser?.id,
            ),
          },
        };
        dispatch(setExportReactionMap(updatedReactionMap));
      }
    }
    return success;
  };

export const deleteReaction =
  (
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
    userId: string,
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { token, currentUser } = getState().user;
    const { reactionMap } = getState().export.exportMaps;
    const { messages, filteredMessages } = getState().message;
    const message = messages.find((m) => m.id === messageId);
    const reaction = message?.reactions?.find(
      (r) => getEncodedEmoji(r.emoji) === emoji,
    );
    const isBurst = !!reactionMap[messageId]?.[emoji]?.find(
      (r) => r.id === currentUser?.id,
    )?.burst;

    if (token && message && reaction) {
      dispatch(setIsModifying(true));
      const success = await dispatch(
        deleteRawReaction(channelId, messageId, emoji, userId),
      );
      if (success) {
        const updatedMessage = {
          ...message,
          reactions: message.reactions
            ?.map((r) => {
              if (getEncodedEmoji(r.emoji) === emoji) {
                return {
                  ...r,
                  count_details: {
                    ...r.count_details,
                    normal: r.count_details.normal - (isBurst ? 0 : 1),
                    burst: r.count_details.burst - (isBurst ? 1 : 0),
                  },
                };
              }
              return r;
            })
            ?.filter((r) => r.count_details.normal || r.count_details.burst),
        };
        const updatedMessages = messages.map((m) => {
          if (m.id === messageId) {
            return updatedMessage;
          }
          return m;
        });
        const updatedFilterMessages = filteredMessages.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message,
        );
        dispatch(setModifyEntity(updatedMessage));
        dispatch(setMessages(updatedMessages));
        dispatch(setFilteredMessages(updatedFilterMessages));
      }
      dispatch(setIsModifying(false));
    }
  };

export const deleteAttachment =
  (attachment: Attachment): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const message = getState().app.task.entity;
    if (isMessage(message)) {
      const shouldEdit =
        (message.content && message.content.length > 0) ||
        message.attachments.length > 1;

      await dispatch(liftThreadRestrictions(message.channel_id, []));

      dispatch(setIsModifying(true));
      if (shouldEdit) {
        const updatedMessage = Object.assign(new Message({ ...message }), {
          attachments: message.attachments.filter(
            (attch) => attch.id !== attachment.id,
          ),
        });
        const success = await dispatch(updateMessage(updatedMessage));
        if (!success) {
          await dispatch(
            notify({
              message: "Entire message must be deleted to remove attachment!",
              timeout: 0.5,
            }),
          );
        } else {
          dispatch(setModifyEntity(updatedMessage));
        }
      } else {
        const success = await dispatch(deleteMessage(message));
        if (!success) {
          await dispatch(
            notify({
              message: "You do not have permission to delete this attachment!",
              timeout: 0.5,
            }),
          );
        } else {
          dispatch(setModifyEntity(null));
        }
      }
      dispatch(setIsModifying(false));
    }
  };

/**
 * Update a message without changing Message State
 * @param message
 * @returns The result of the update
 */
export const updateRawMessage =
  (message: Message): AppThunk<Promise<{ success: boolean; data: Message }>> =>
  async (_dispatch, getState) => {
    const { settings } = getState().app;
    const { token } = getState().user;
    let retObj = { success: false, data: message };

    if (token) {
      const { success, data } = await new DiscordService(settings).editMessage(
        token,
        message.id,
        {
          content: message.content,
          attachments: message.attachments,
        },
        message.channel_id,
      );
      if (success) {
        retObj = Object.assign(retObj, { success: true, data });
      }
    }

    return retObj;
  };

export const updateMessage =
  (message: Message): AppThunk<Promise<boolean>> =>
  async (dispatch, getState) => {
    const { entity: modifyMessage } = getState().app.task;

    if (isMessage(modifyMessage)) {
      const { success, data } = await dispatch(updateRawMessage(message));

      if (success && data) {
        const { messages, filteredMessages } = getState().message;
        const updatedMessage = new Message(data);
        const updatedMessages = messages.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message,
        );
        const updatedFilterMessages = filteredMessages.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message,
        );
        const updatedModifyMessage =
          modifyMessage?.id === updatedMessage.id
            ? updatedMessage
            : modifyMessage;

        dispatch(setMessages(updatedMessages));
        dispatch(setFilteredMessages(updatedFilterMessages));
        dispatch(setModifyEntity(updatedModifyMessage));

        return true;
      }
    }
    return false;
  };

export const editMessages =
  (messages: Message[], updateText: string): AppThunk =>
  async (dispatch, getState) => {
    dispatch(setIsModifying(true));
    let noPermissionThreadIds: Snowflake[] = [];
    for (const message of messages) {
      if (await dispatch(isAppStopped())) break;

      noPermissionThreadIds = await dispatch(
        liftThreadRestrictions(message.channel_id, noPermissionThreadIds),
      );

      dispatch(setModifyEntity(message));

      const isMissingPermission = noPermissionThreadIds.some(
        (tId) => tId === message.channel_id,
      );
      if (isMissingPermission) {
        await dispatch(
          notify({
            message: "Permission missing for message, skipping edit",
            timeout: 1,
          }),
        );
      } else {
        let success = false;

        if (!getState().app.discrubCancelled) {
          success = await dispatch(
            updateMessage(
              Object.assign(new Message({ ...message }), {
                content: updateText,
              }),
            ),
          );
        }

        if (!success) {
          await dispatch(
            notify({
              message: "You do not have permission to modify this message!",
              timeout: 2,
            }),
          );
        }
      }
    }
    dispatch(resetModify());
    dispatch(setDiscrubCancelled(false));
  };

/**
 * Delete a message without updating Message State
 * @param message
 * @returns The result of the deletion
 */
export const deleteRawMessage =
  (message: Message): AppThunk<Promise<boolean>> =>
  async (_dispatch, getState) => {
    const { settings } = getState().app;
    const { token } = getState().user;

    if (token) {
      const { success } = await new DiscordService(settings).deleteMessage(
        token,
        message.id,
        message.channel_id,
      );
      if (success) {
        return true;
      }
    }

    return false;
  };

export const deleteMessage =
  (message: Message): AppThunk<Promise<boolean>> =>
  async (dispatch, getState) => {
    const result = await dispatch(deleteRawMessage(message));

    if (result) {
      const { messages, filteredMessages, selectedMessages } =
        getState().message;
      const updatedMessages = messages.filter(
        ({ id: messageId }) => messageId !== message.id,
      );
      const updatedFilterMessages = filteredMessages.filter(
        ({ id: messageId }) => messageId !== message.id,
      );
      const updatedSelectMessages = selectedMessages.filter(
        (messageId) => messageId !== message.id,
      );

      dispatch(setMessages(updatedMessages));
      dispatch(setFilteredMessages(updatedFilterMessages));
      dispatch(setSelected(updatedSelectMessages));
    }

    return result;
  };

export const deleteMessages =
  (
    messages: Message[],
    deleteConfig: DeleteConfiguration = {
      attachments: true,
      messages: true,
      reactions: false,
    },
  ): AppThunk =>
  async (dispatch, getState) => {
    dispatch(setIsModifying(true));
    let noPermissionThreadIds: Snowflake[] = [];
    for (const [count, currentRow] of messages.entries()) {
      if (await dispatch(isAppStopped())) break;

      noPermissionThreadIds = await dispatch(
        liftThreadRestrictions(currentRow.channel_id, noPermissionThreadIds),
      );

      dispatch(
        setModifyEntity(
          Object.assign(new Message({ ...currentRow }), {
            _index: count + 1,
            _total: messages.length,
          }),
        ),
      );
      const isMissingPermission = noPermissionThreadIds.some(
        (tId) => tId === currentRow.channel_id,
      );
      if (isMissingPermission) {
        await dispatch(
          notify({
            message: "Permission missing for message, skipping delete",
            timeout: 1,
          }),
        );
      } else {
        const shouldDelete =
          isRemovableMessage(currentRow) &&
          ((deleteConfig.attachments && deleteConfig.messages) ||
            (currentRow.content.length === 0 && deleteConfig.attachments) ||
            (currentRow.attachments.length === 0 && deleteConfig.messages));
        const shouldEdit = deleteConfig.attachments || deleteConfig.messages;

        if (shouldDelete && !getState().app.discrubCancelled) {
          const success = await dispatch(
            deleteMessage(new Message({ ...currentRow })),
          );

          if (!success) {
            await dispatch(
              notify({
                message: "You do not have permission to modify this message!",
                timeout: 2,
              }),
            );
          }
        } else if (shouldEdit && !getState().app.discrubCancelled) {
          const success = await dispatch(
            updateMessage(
              Object.assign(
                new Message({ ...currentRow }),
                deleteConfig.attachments
                  ? { attachments: [] }
                  : { content: "" },
              ),
            ),
          );
          if (!success) {
            await dispatch(
              notify({
                message: "You do not have permission to modify this message!",
                timeout: 2,
              }),
            );
          }
        } else break;
      }
    }
    dispatch(resetModify());
    dispatch(setDiscrubCancelled(false));
  };

export const resetMessageData = (): AppThunk => (dispatch) => {
  dispatch(_resetMessageData());
  dispatch(resetThreads());
  dispatch(resetExportMaps(["reactionMap"]));
  dispatch(resetStatus());
};

const _fetchReactingUserIds =
  (
    message: Message,
    encodedEmoji: string,
  ): AppThunk<Promise<ExportReaction[]>> =>
  async (dispatch, getState) => {
    const exportReactions: ExportReaction[] = [];
    const { settings } = getState().app;
    const { token } = getState().user;

    for (const type of [ReactionType.NORMAL, ReactionType.BURST]) {
      let reachedEnd = false;
      let lastId = null;
      while (!reachedEnd) {
        if ((await dispatch(isAppStopped())) || !token) break;
        const { success, data } = await new DiscordService(
          settings,
        ).getReactions(
          token,
          message.channel_id,
          message.id,
          encodedEmoji,
          type,
          lastId,
        );
        if (success && data && data.length) {
          const { userMap } = getState().export.exportMaps;
          const updateMap = { ...userMap };
          data.forEach((u) => {
            exportReactions.push({
              id: u.id,
              burst: type === ReactionType.BURST,
            });

            updateMap[u.id] = {
              ...getUserMappingData(u),
              guilds: updateMap[u.id]?.guilds || {},
            };
          });
          dispatch(setExportUserMap(updateMap));
          lastId = data[data.length - 1].id;
        } else {
          reachedEnd = true;
        }
      }
    }

    return exportReactions;
  };

const _generateReactionMap =
  (messages: Message[]): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const reactionMap: ExportReactionMap = {};
    const { token } = getState().user;
    const filteredMessages = messages.filter((m) => !!m.reactions?.length);
    for (const [mI, message] of filteredMessages.entries()) {
      reactionMap[message.id] = {};
      if (await dispatch(isAppStopped())) break;

      if (message.reactions?.length && token) {
        for (const [i, reaction] of message.reactions.entries()) {
          const { emoji } = reaction;
          const encodedEmoji = getEncodedEmoji(emoji);
          const brackets = emoji.id ? ":" : "";

          const status = `[${mI + 1}/${
            filteredMessages.length
          }] Reaction Lookup (${i + 1} of ${message.reactions.length}): ${
            message.id
          } ${brackets}${emoji.name}${brackets}`;
          dispatch(setStatus(status));

          if ((await dispatch(isAppStopped())) || !encodedEmoji) break;

          reactionMap[message.id][encodedEmoji] = await dispatch(
            _fetchReactingUserIds(message, encodedEmoji),
          );
        }
      }
    }
    dispatch(resetStatus());
    dispatch(setExportReactionMap(reactionMap));
  };

/**
 * Retrieve message data without mutating MessageState
 * @param guildId
 * @param channelId
 * @param options
 */
export const retrieveMessages =
  (
    guildId: string | null,
    channelId: string | null,
    options: Partial<MessageSearchOptions> = {},
  ): AppThunk<Promise<MessageData & Partial<SearchResultData>>> =>
  async (dispatch, getState) => {
    const { token } = getState().user;
    const { settings } = getState().app;
    const searchCriteria: SearchCriteria = {
      ...getState().message.searchCriteria,
      ...(options.searchCriteriaOverrides || {}),
    };

    let payload: MessageData & Partial<SearchResultData> = {
      messages: [],
      threads: [],
      totalMessages: 0,
      offset: 0,
      searchCriteria: searchCriteria,
    };

    if (token) {
      if (isCriteriaActive(searchCriteria)) {
        payload = await dispatch(
          _getSearchMessages(channelId, guildId, searchCriteria, options),
        );
      } else if (channelId) {
        payload = await dispatch(_getMessages(channelId));
      }

      if (!getState().app.discrubCancelled) {
        const isReactionRemovalMode = !!settings.purgeReactionRemovalFrom;
        const reactionsEnabled = stringToBool(settings.reactionsEnabled);
        const requiresReactionMap =
          isReactionRemovalMode ||
          (!options.excludeReactions && reactionsEnabled);
        if (requiresReactionMap) {
          await dispatch(_generateReactionMap(payload.messages));
        }
        if (!options.excludeUserLookups) {
          const userMap = await dispatch(_getUserMap(payload.messages));
          await dispatch(_collectUserNames(userMap));
          if (guildId) {
            await dispatch(_collectUserGuildData(userMap, guildId));
            dispatch(getPreFilterUsers(guildId));
          }
        }
      }
      dispatch(resetStatus());
    }

    return payload;
  };

export const getMessageData =
  (
    guildId: string | null,
    channelId: string | null,
    options: Partial<MessageSearchOptions> = {},
  ): AppThunk<Promise<MessageData & Partial<SearchResultData>>> =>
  async (dispatch, _getState) => {
    dispatch(resetMessageData());
    dispatch(setIsLoading(true));

    const payload = await dispatch(
      retrieveMessages(guildId, channelId, options),
    );

    dispatch(setThreads(payload.threads));
    dispatch(setMessages(getSortedMessages(payload.messages)));
    dispatch(setIsLoading(false));
    dispatch(resetStatus());

    dispatch(setDiscrubCancelled(false)); // TODO: What if we are exporting?

    return payload;
  };

const _getUserMap =
  (messages: Message[]): AppThunk<Promise<ExportUserMap>> =>
  async (_, getState) => {
    const { userMap: existingUserMap, reactionMap } =
      getState().export.exportMaps;
    const { settings } = getState().app;
    const defaultMapping = {
      userName: null,
      displayName: null,
      avatar: null,
      guilds: {},
    };
    const userMap: ExportUserMap = {};
    const reactionsEnabled = stringToBool(settings.reactionsEnabled);
    messages.forEach((message) => {
      const content = message.content;
      const author = message.author;

      const userId = author.id;
      if (!userMap[userId]) {
        userMap[userId] = existingUserMap[userId] || {
          ...defaultMapping,
          userName: author.username,
          displayName: author.global_name,
          avatar: author.avatar,
        };
      }

      Array.from(content.matchAll(MessageRegex.USER_MENTION))?.forEach(
        ({ groups: userMentionGroups }) => {
          const mentionId = userMentionGroups?.user_id;
          if (mentionId && !userMap[mentionId]) {
            userMap[mentionId] = existingUserMap[mentionId] || defaultMapping;
          }
        },
      );

      if (reactionsEnabled) {
        for (const reaction of message.reactions || []) {
          const encodedEmoji = getEncodedEmoji(reaction.emoji);
          if (encodedEmoji) {
            const exportReactions =
              reactionMap[message.id]?.[encodedEmoji] || [];
            exportReactions.forEach(({ id: reactingUserId }) => {
              if (!userMap[reactingUserId])
                userMap[reactingUserId] =
                  existingUserMap[reactingUserId] || defaultMapping;
            });
          }
        }
      }
    });

    return userMap;
  };

const _collectUserNames =
  (userMap: ExportUserMap): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { settings } = getState().app;
    const { displayNameLookup, appUserDataRefreshRate } = settings;
    const { token } = getState().user;
    const { userMap: existingUserMap } = getState().export.exportMaps;
    const updateMap = { ...userMap };

    if (token && stringToBool(displayNameLookup)) {
      const userIds = Object.keys(updateMap);
      for (const [i, userId] of userIds.entries()) {
        if (await dispatch(isAppStopped())) break;
        const mapping = existingUserMap[userId] || updateMap[userId];
        const { userName, displayName, timestamp } = mapping;

        const status = `Alias Lookup (${i + 1} of ${
          userIds.length
        }): ${userId}`;
        dispatch(setStatus(status));

        const isMissingOrStale =
          (!userName && !displayName) ||
          isUserDataStale(timestamp, appUserDataRefreshRate);

        if (isMissingOrStale) {
          const { success, data } = await new DiscordService(settings).getUser(
            token,
            userId,
          );
          if (success && data) {
            updateMap[userId] = {
              ...mapping,
              ...getUserMappingData(data),
            };
          } else {
            const errorMsg = `Unable to retrieve data from userId: ${userId}`;
            console.error(errorMsg);
          }
        }
      }
      dispatch(resetStatus());
      dispatch(setExportUserMap({ ...existingUserMap, ...updateMap }));
    }
  };

const _collectUserGuildData =
  (userMap: ExportUserMap, guildId: Snowflake): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { settings } = getState().app;
    const { serverNickNameLookup, appUserDataRefreshRate } = settings;
    const { token } = getState().user;
    const { userMap: existingUserMap } = getState().export.exportMaps;
    const updateMap = { ...userMap };

    if (token && stringToBool(serverNickNameLookup)) {
      const userIds = Object.keys(updateMap);
      for (const [i, userId] of userIds.entries()) {
        if (await dispatch(isAppStopped())) break;
        const userMapping = existingUserMap[userId] || updateMap[userId];
        const userGuilds = userMapping.guilds;

        const status = `Guild User Lookup (${i + 1} of ${
          userIds.length
        }): ${userId}`;
        dispatch(setStatus(status));

        const isMissingOrStale =
          !userGuilds[guildId] ||
          isUserDataStale(
            userGuilds[guildId].timestamp,
            appUserDataRefreshRate,
          );

        if (isMissingOrStale) {
          const { success, data } = await new DiscordService(
            settings,
          ).fetchGuildUser(guildId, userId, token);

          if (success && data) {
            updateMap[userId] = {
              ...userMapping,
              guilds: {
                ...userGuilds,
                [guildId]: getGMOMappingData(data),
              },
            };
          } else {
            const errorMsg = `Unable to retrieve guild user data from userId ${userId} and guildId ${guildId}`;
            console.error(errorMsg);
            updateMap[userId] = {
              ...userMapping,
              guilds: {
                ...userGuilds,
                [guildId]: {
                  ...defaultGMOMappingData,
                },
              },
            };
          }
        }
      }
      dispatch(resetStatus());
      dispatch(setExportUserMap({ ...existingUserMap, ...updateMap }));
    }
  };

/**
 * Attempt to resolve reaction data for the provided messages. Used for when messages are obtained using Discords search API
 * @param messages
 */
const _resolveMessageReactions =
  (messages: Message[]): AppThunk<Promise<Message[]>> =>
  async (dispatch, getState) => {
    const { settings } = getState().app;
    const { token } = getState().user;
    const trackMap: Record<Snowflake, Reaction[]> = {};
    let retArr: Message[] = [...messages];

    if (token) {
      for (const [i, message] of messages.entries()) {
        if (await dispatch(isAppStopped())) break;

        const status = `Reaction Allocation (${i + 1} of ${messages.length}): ${
          message.id
        }`;
        dispatch(setStatus(status));

        if (!trackMap[message.id]) {
          const { success, data } = await new DiscordService(
            settings,
          ).fetchMessageData(
            token,
            message.id,
            message.channel_id,
            QueryStringParam.AROUND,
          );

          if (success && data) {
            data.forEach((m) => {
              trackMap[m.id] = m.reactions || [];
            });
          }
        }
      }
      dispatch(resetStatus());
      retArr = messages.map((message) => ({
        ...message,
        reactions: trackMap[message.id],
      }));
    }

    return retArr;
  };

const _getNextSearchData = (
  message: Message,
  offset: number,
  totalMessages: number,
  isEndConditionMet: boolean,
  searchCriteria: SearchCriteria,
  endOffSet?: number,
) => {
  const searchData = {
    offset: offset,
    isEndConditionMet: isEndConditionMet,
    searchCriteria: searchCriteria,
  };
  const nextOffSet = offset + OFFSET_INCREMENT;
  const isMaxOffset = offset === MAX_OFFSET;
  const isLimitedResults =
    !!endOffSet && isSearchComplete(nextOffSet, endOffSet);
  const isAllResults = isSearchComplete(nextOffSet, totalMessages);

  if (isMaxOffset) {
    Object.assign(searchData, {
      isEndConditionMet:
        isLimitedResults || isAllResults || searchData.isEndConditionMet,
      offset: START_OFFSET,
      searchCriteria: {
        ...searchCriteria,
        searchBeforeDate: parseISO(message.timestamp),
      },
    });
  } else if (isAllResults) {
    Object.assign(searchData, {
      isEndConditionMet: true,
      offset: START_OFFSET,
    });
  } else if (isLimitedResults) {
    Object.assign(searchData, { isEndConditionMet: true, offset: nextOffSet });
  } else {
    Object.assign(searchData, { offset: nextOffSet });
  }

  return searchData;
};

const _getNextSearchStatus = (
  threads: Channel[],
  messages: Message[],
  totalMessages: number,
  channel?: Channel,
) => {
  let status = "";
  if (isGuildForum(channel)) {
    status = `Fetched ${threads.length} Threads`;
  } else {
    const channelName = channel?.name || "";
    const ratio = `${messages.length} / ${totalMessages}`;
    status = `Fetched ${ratio} Messages ${channelName}`;
  }
  return status;
};

const _getSearchMessages =
  (
    channelId: string | null,
    guildId: string | null,
    searchCriteria: SearchCriteria,
    {
      excludeReactions,
      startOffSet,
      endOffSet,
    }: Partial<MessageSearchOptions> = {},
  ): AppThunk<Promise<MessageData & SearchResultData>> =>
  async (dispatch, getState) => {
    const { settings } = getState().app;
    const { token } = getState().user;
    const { channels } = getState().channel;
    const { dms } = getState().dm;
    const combinedChannels = [...channels, ...dms];
    const channel = combinedChannels.find((c) => c.id === channelId);

    let knownMessages: Message[] = [];
    const knownThreads: Channel[] = [];
    let { offset, isEndConditionMet, criteria, totalMessages } = {
      offset: startOffSet || 0,
      isEndConditionMet: false,
      criteria: { ...searchCriteria },
      totalMessages: 0,
    };

    if (token) {
      while (!isEndConditionMet) {
        if (await dispatch(isAppStopped())) break;

        const { success, data } = await new DiscordService(
          settings,
        ).fetchSearchMessageData(token, offset, channelId, guildId, criteria);

        if (success && data) {
          let { total_results, messages = [], threads = [] } = data;
          const isResultsFound = !!total_results || messages.length > 0;

          // Ensure totalMessages is up-to-date so that _getSearchData can assign the correct offset
          totalMessages = total_results;

          if (!isResultsFound) {
            break;
          }

          for (const t of threads) {
            const isKnownThread = knownThreads.some((k) => k.id === t.id);
            if (!isKnownThread) {
              knownThreads.push(t);
            }
          }

          messages = messages.flat();
          const lastMessage = messages[messages.length - 1];
          ({
            isEndConditionMet,
            offset,
            searchCriteria: criteria,
          } = _getNextSearchData(
            lastMessage,
            offset,
            totalMessages,
            isEndConditionMet,
            criteria,
            endOffSet,
          ));

          for (const m of messages) {
            if (_messageTypeAllowed(m.type)) knownMessages.push(m);
          }

          const status = _getNextSearchStatus(
            knownThreads,
            knownMessages,
            totalMessages,
            channel,
          );
          dispatch(setStatus(status));
        } else {
          isEndConditionMet = true;
        }
      }

      const reactionsEnabled = stringToBool(settings.reactionsEnabled);
      const isReactionRemovalMode = !!settings.purgeReactionRemovalFrom;
      if (isReactionRemovalMode || (!excludeReactions && reactionsEnabled)) {
        knownMessages = await dispatch(_resolveMessageReactions(knownMessages));
      }
    }
    dispatch(resetStatus());
    return {
      messages: knownMessages,
      threads: knownThreads,
      offset: offset, // The next offset to use for an additional search
      searchCriteria: criteria, // The Search Criteria at the time the search ended (mutated by _getNextSearchData)
      totalMessages: totalMessages, // The total amount of messages that exist for the search
    };
  };

const _messageTypeAllowed = (type: number) => {
  return [
    MessageType.DEFAULT,
    MessageType.CHANNEL_PINNED_MESSAGE,
    MessageType.USER_JOIN,
    MessageType.GUILD_BOOST,
    MessageType.GUILD_BOOST_TIER_1,
    MessageType.GUILD_BOOST_TIER_2,
    MessageType.GUILD_BOOST_TIER_3,
    MessageType.CHANNEL_FOLLOW_ADD,
    MessageType.THREAD_CREATED,
    MessageType.REPLY,
    MessageType.CHAT_INPUT_COMMAND,
    MessageType.GUILD_INVITE_REMINDER,
    MessageType.CONTEXT_MENU_COMMAND,
    MessageType.AUTO_MODERATION_ACTION,
    MessageType.CALL,
  ].some((t) => messageTypeEquals(type, t));
};

const _getMessages =
  (channelId: Snowflake): AppThunk<Promise<MessageData>> =>
  async (dispatch, getState) => {
    const { channels } = getState().channel;
    const { dms } = getState().dm;
    const { searchCriteria } = getState().message;
    const channel =
      channels.find((c) => channelId === c.id) ||
      dms.find((d) => channelId === d.id);
    const trackedThreads: Channel[] = [];
    const messages: Message[] = [];

    if (channel) {
      if (isGuildForum(channel)) {
        const { threads } = await dispatch(
          _getSearchMessages(
            channelId,
            channel.guild_id || null,
            searchCriteria,
          ),
        );
        threads.forEach((t) => {
          if (!trackedThreads.some((tt) => tt.id === t.id)) {
            trackedThreads.push(t);
          }
        });
      } else {
        (await dispatch(_getMessagesFromChannel(channelId))).forEach((m) =>
          messages.push(m),
        );
      }

      if (!isDm(channel)) {
        const threadsFromMessages = getThreadsFromMessages({
          messages,
          knownThreads: trackedThreads,
        });
        threadsFromMessages.forEach((ft) => trackedThreads.push(ft));

        const archivedThreads = await dispatch(
          getArchivedThreads({ channelId, knownThreads: trackedThreads }),
        );
        archivedThreads.forEach((at) => trackedThreads.push(at));

        for (const thread of trackedThreads) {
          (await dispatch(_getMessagesFromChannel(thread.id))).forEach((m) =>
            messages.push(m),
          );
        }
      }
    }
    return {
      messages,
      threads: trackedThreads,
    };
  };

const _getMessagesFromChannel =
  (channelId: Snowflake): AppThunk<Promise<Message[]>> =>
  async (dispatch, getState) => {
    const { settings } = getState().app;
    const { token } = getState().user;
    let lastId = "";
    let reachedEnd = false;
    const messages: Message[] = [];

    if (token) {
      while (!reachedEnd) {
        if (await dispatch(isAppStopped())) break;
        const { success, data } = await new DiscordService(
          settings,
        ).fetchMessageData(token, lastId, channelId);

        if (success && data) {
          if (data.length < 100) reachedEnd = true;
          if (data.length > 0) lastId = data[data.length - 1].id;
          const hasValidMessages = Boolean(
            data[0]?.content || data[0]?.attachments,
          );
          if (hasValidMessages) {
            data
              .filter((m) => _messageTypeAllowed(m.type))
              .forEach((m) => messages.push(m));

            const status = `Fetched ${messages.length} Messages`;
            dispatch(setStatus(status));
          }
        } else {
          break;
        }
      }
    }
    dispatch(resetStatus());

    return messages;
  };

export default messageSlice.reducer;
