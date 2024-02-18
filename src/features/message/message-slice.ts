import { createSlice } from "@reduxjs/toolkit";
import {
  editMessage as editMsg,
  deleteMessage as delMsg,
  getUser,
  fetchSearchMessageData,
  fetchMessageData,
  fetchGuildUser,
  getReactions,
  deleteReaction as delReaction,
} from "../../services/discord-service";
import { getEncodedEmoji, isDm, sortByProperty } from "../../utils";
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
  checkDiscrubPaused,
  resetModify,
  setDiscrubCancelled,
  setIsModifying,
  setModifyEntity,
  setTimeoutMessage as notify,
} from "../app/app-slice";
import { MessageRegex } from "../../enum/message-regex";
import {
  resetExportMaps,
  setExportReactionMap,
  setExportUserMap,
} from "../export/export-slice";
import { getPreFilterUsers } from "../guild/guild-slice";
import { format, isDate, parseISO } from "date-fns";
import {
  DeleteConfiguration,
  FetchProgress,
  Filter,
  MessageData,
  MessageState,
  SearchMessageProps,
} from "./message-types";
import { SortDirection } from "../../enum/sort-direction";
import { HasType } from "../../enum/has-type";
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
import { ChannelType } from "../../enum/channel-type";
import { QueryStringParam } from "../../enum/query-string-param";
import { Reaction } from "../../classes/reaction";
import { ReactionType } from "../../enum/reaction-type";

const _descendingComparator = <Message>(
  a: Message,
  b: Message,
  orderBy: keyof Message
) => {
  return b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0;
};

const defaultFetchProgress: FetchProgress = {
  messageCount: 0,
  channelId: null,
  threadCount: 0,
  parsingThreads: false,
};

const initialState: MessageState = {
  messages: [],
  selectedMessages: [],
  filteredMessages: [],
  filters: [],
  fetchProgress: defaultFetchProgress,
  lookupUserId: null,
  lookupReactionMessageId: null,
  isLoading: null,
  order: SortDirection.ASCENDING,
  orderBy: "timestamp",
  searchBeforeDate: null,
  searchAfterDate: null,
  totalSearchMessages: 0,
  searchMessageContent: null,
  selectedHasTypes: [],
};

export const messageSlice = createSlice({
  name: "message",
  initialState: initialState,
  reducers: {
    setIsLoading: (state, { payload }: { payload: boolean }): void => {
      state.isLoading = payload;
    },
    setSelectedHasTypes: (state, { payload }: { payload: HasType[] }): void => {
      state.selectedHasTypes = payload;
    },
    setSearchMessageContent: (
      state,
      { payload }: { payload: string | Maybe }
    ): void => {
      state.searchMessageContent = payload;
    },
    setSearchBeforeDate: (
      state,
      { payload }: { payload: Date | Maybe }
    ): void => {
      state.searchBeforeDate = payload;
    },
    setSearchAfterDate: (
      state,
      { payload }: { payload: Date | Maybe }
    ): void => {
      state.searchAfterDate = payload;
    },
    setSelected: (state, { payload }: { payload: Snowflake[] }): void => {
      state.selectedMessages = payload;
    },
    setOrder: (
      state,
      { payload }: { payload: { order: SortDirection; orderBy: keyof Message } }
    ): void => {
      const { order, orderBy } = payload;
      state.order = order;
      state.orderBy = orderBy;
      state.messages = state.messages.sort(
        payload.order === SortDirection.DESCENDING
          ? (a, b) => _descendingComparator(a, b, orderBy)
          : (a, b) => -_descendingComparator(a, b, orderBy)
      );
      state.filteredMessages = state.filteredMessages.sort(
        payload.order === SortDirection.DESCENDING
          ? (a, b) => _descendingComparator(a, b, orderBy)
          : (a, b) => -_descendingComparator(a, b, orderBy)
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
      state.lookupUserId = null;
      state.lookupReactionMessageId = null;
      state.fetchProgress = defaultFetchProgress;
      state.totalSearchMessages = 0;
      state.isLoading = null;
    },
    setLookupUserId: (
      state,
      { payload }: { payload: Snowflake | Maybe }
    ): void => {
      state.lookupUserId = payload;
    },
    setLookupReactionMessageId: (
      state,
      { payload }: { payload: Snowflake | Maybe }
    ): void => {
      state.lookupReactionMessageId = payload;
    },
    setFetchProgress: (
      state,
      { payload }: { payload: Partial<FetchProgress> }
    ): void => {
      state.fetchProgress = { ...state.fetchProgress, ...payload };
    },
    resetFetchProgress: (state): void => {
      state.fetchProgress = defaultFetchProgress;
    },
    setTotalSearchMessages: (state, { payload }: { payload: number }): void => {
      state.totalSearchMessages = payload;
    },
    resetFilters: (state): void => {
      state.filters = [];
      state.filteredMessages = [];
    },
    resetAdvancedFilters: (state): void => {
      state.searchBeforeDate = null;
      state.searchAfterDate = null;
      state.searchMessageContent = null;
      state.selectedHasTypes = [];
    },
    updateFilters: (state, { payload }: { payload: Filter }): void => {
      const { filterName, filterValue, filterType } = payload;
      const filteredList = state.filters.filter(
        (x) => x.filterName !== filterName
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
            (filter) => filter.filterName !== filterName
          );
        }
      }
      state.filters = retFilters;
    },
    filterMessages: (state): void => {
      let retArr: Message[] = [];
      const inverseActive = state.filters
        .filter((f) => f.filterName)
        .some((filter) => filter.filterName === FilterName.INVERSE);
      const activeFilterCount = state.filters.length;

      if (
        (activeFilterCount === 1 && inverseActive) ||
        activeFilterCount === 0
      ) {
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
                    inverseActive
                  );
                } else if (param.filterName === FilterName.CONTENT) {
                  criteriaMet = _filterMessageContent(
                    param.filterValue,
                    x,
                    inverseActive
                  );
                } else {
                  criteriaMet = _filterText(
                    param.filterName,
                    param.filterValue,
                    x,
                    inverseActive
                  );
                }
                return criteriaMet;
              } else if (param.filterType === FilterType.DATE) {
                if (param.filterName === FilterName.START_TIME) {
                  criteriaMet = _filterStartTime(
                    param.filterValue,
                    x,
                    inverseActive
                  );
                } else if (param.filterName === FilterName.END_TIME) {
                  criteriaMet = _filterEndTime(
                    param.filterValue,
                    x,
                    inverseActive
                  );
                }
              } else if (param.filterType === FilterType.THREAD) {
                criteriaMet = _filterThread(
                  param.filterValue,
                  x,
                  inverseActive
                );
              }
            }
          });
          if (criteriaMet) retArr.push(x);
        });
      }

      state.filteredMessages = retArr;
      state.selectedMessages = retArr
        .filter((m) => state.selectedMessages.some((mId) => m.id === mId))
        .map((m) => m.id);
    },
  },
});

const _filterThread = (
  filterValue: Snowflake,
  message: Message,
  inverseActive: boolean
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
  inverseActive: boolean
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
  inverseActive: boolean
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
  filterValue: string,
  message: Message,
  inverseActive: boolean
): boolean => {
  const messagePropertyValue = message[filterName];
  if (typeof messagePropertyValue === "string") {
    const textContainsValue = messagePropertyValue.includes(filterValue);
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
  filterValue: string,
  message: Message,
  inverseActive: boolean
) => {
  const csvAttachments = message.attachments.map((a) => a.filename).join();
  const attachmentsIncludeValue = csvAttachments
    .toLowerCase()
    .includes(filterValue.toLowerCase());
  const criteriaMet =
    (inverseActive && attachmentsIncludeValue) ||
    (!inverseActive && !attachmentsIncludeValue);
  if (criteriaMet) {
    return false;
  }
  return true;
};

const _filterMessageContent = (
  filterValue: string,
  message: Message,
  inverseActive: boolean
) => {
  const contentContainsValue = message.content.includes(filterValue);
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
        ].some((prop) => prop?.includes(filterValue)) ||
          fields?.some((field) =>
            [field.name, field.value].some((fieldProp) =>
              fieldProp?.includes(filterValue)
            )
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
  setSelectedHasTypes,
  setSearchMessageContent,
  setSearchBeforeDate,
  setSearchAfterDate,
  setSelected,
  setOrder,
  setMessages,
  setFilteredMessages,
  _resetMessageData,
  setLookupUserId,
  setLookupReactionMessageId,
  setFetchProgress,
  resetFetchProgress,
  setTotalSearchMessages,
  resetFilters,
  resetAdvancedFilters,
  updateFilters,
  filterMessages,
} = messageSlice.actions;

export const deleteReaction =
  (
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { token, currentUser } = getState().user;
    const { reactionMap } = getState().export.exportMaps;
    const { messages, filteredMessages } = getState().message;
    const message = messages.find((m) => m.id === messageId);
    const reaction = message?.reactions?.find(
      (r) => getEncodedEmoji(r.emoji) === emoji
    );
    const isBurst = !!reactionMap[messageId]?.[emoji]?.find(
      (r) => r.id === currentUser?.id
    )?.burst;

    if (token && message && reaction) {
      dispatch(setIsModifying(true));
      const { success } = await delReaction(token, channelId, messageId, emoji);
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
          message.id === updatedMessage.id ? updatedMessage : message
        );
        const updatedReactionMap = {
          ...reactionMap,
          [messageId]: {
            ...reactionMap[messageId],
            [emoji]: reactionMap[messageId][emoji].filter(
              (er) => er.id !== currentUser?.id
            ),
          },
        };
        dispatch(setModifyEntity(updatedMessage));
        dispatch(setMessages(updatedMessages));
        dispatch(setFilteredMessages(updatedFilterMessages));
        dispatch(setExportReactionMap(updatedReactionMap));
      }
      dispatch(setIsModifying(false));
    }
  };

export const deleteAttachment =
  (attachment: Attachment): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const message = getState().app.modify.entity;
    if (isMessage(message)) {
      const shouldEdit =
        (message.content && message.content.length > 0) ||
        message.attachments.length > 1;

      await dispatch(
        liftThreadRestrictions({
          channelId: message.channel_id,
          noPermissionThreadIds: [],
        })
      );

      dispatch(setIsModifying(true));
      if (shouldEdit) {
        const updatedMessage = Object.assign(new Message({ ...message }), {
          attachments: message.attachments.filter(
            (attch) => attch.id !== attachment.id
          ),
        });
        const success = await dispatch(updateMessage(updatedMessage));
        if (!success) {
          await dispatch(
            notify({
              message: "Entire message must be deleted to remove attachment!",
              timeout: 0.5,
            })
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
            })
          );
        } else {
          dispatch(setModifyEntity(null));
        }
      }
      dispatch(setIsModifying(false));
    }
  };

export const updateMessage =
  (message: Message): AppThunk<Promise<boolean>> =>
  async (dispatch, getState) => {
    const { token } = getState().user;
    const { entity: modifyMessage } = getState().app.modify;

    if (token && isMessage(modifyMessage)) {
      const { success, data } = await editMsg(
        token,
        message.id,
        {
          content: message.content,
          attachments: message.attachments,
        },
        message.channel_id
      );

      if (success && data) {
        const { messages, filteredMessages } = getState().message;
        const updatedMessage = new Message(data);
        const updatedMessages = messages.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message
        );
        const updatedFilterMessages = filteredMessages.map((message) =>
          message.id === updatedMessage.id ? updatedMessage : message
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
      if (getState().app.discrubCancelled) break;
      await dispatch(checkDiscrubPaused());

      noPermissionThreadIds = await dispatch(
        liftThreadRestrictions({
          channelId: message.channel_id,
          noPermissionThreadIds,
        })
      );

      dispatch(setModifyEntity(message));

      const isMissingPermission = noPermissionThreadIds.some(
        (tId) => tId === message.channel_id
      );
      if (isMissingPermission) {
        await dispatch(
          notify({
            message: "Permission missing for message, skipping edit",
            timeout: 1,
          })
        );
      } else {
        let success = false;

        if (!getState().app.discrubCancelled) {
          success = await dispatch(
            updateMessage(
              Object.assign(new Message({ ...message }), {
                content: updateText,
              })
            )
          );
        }

        if (!success) {
          await dispatch(
            notify({
              message: "You do not have permission to modify this message!",
              timeout: 2,
            })
          );
        }
      }
    }
    dispatch(resetModify());
    dispatch(setDiscrubCancelled(false));
  };

export const deleteMessage =
  (message: Message): AppThunk<Promise<boolean>> =>
  async (dispatch, getState) => {
    const { token } = getState().user;

    if (token) {
      const { success } = await delMsg(token, message.id, message.channel_id);
      if (success) {
        const { messages, filteredMessages, selectedMessages } =
          getState().message;
        const updatedMessages = messages.filter(
          ({ id: messageId }) => messageId !== message.id
        );
        const updatedFilterMessages = filteredMessages.filter(
          ({ id: messageId }) => messageId !== message.id
        );
        const updatedSelectMessages = selectedMessages.filter(
          (messageId) => messageId !== message.id
        );

        dispatch(setMessages(updatedMessages));
        dispatch(setFilteredMessages(updatedFilterMessages));
        dispatch(setSelected(updatedSelectMessages));

        return true;
      }
    }

    return false;
  };

export const deleteMessages =
  (
    messages: Message[],
    deleteConfig: DeleteConfiguration = {
      attachments: true,
      messages: true,
    }
  ): AppThunk =>
  async (dispatch, getState) => {
    dispatch(setIsModifying(true));
    let noPermissionThreadIds: Snowflake[] = [];
    for (const [count, currentRow] of messages.entries()) {
      if (getState().app.discrubCancelled) break;
      await dispatch(checkDiscrubPaused());

      noPermissionThreadIds = await dispatch(
        liftThreadRestrictions({
          channelId: currentRow.channel_id,
          noPermissionThreadIds,
        })
      );

      dispatch(
        setModifyEntity(
          Object.assign(new Message({ ...currentRow }), {
            _index: count + 1,
            _total: messages.length,
          })
        )
      );
      const isMissingPermission = noPermissionThreadIds.some(
        (tId) => tId === currentRow.channel_id
      );
      if (isMissingPermission) {
        await dispatch(
          notify({
            message: "Permission missing for message, skipping delete",
            timeout: 1,
          })
        );
      } else {
        const shouldDelete =
          (deleteConfig.attachments && deleteConfig.messages) ||
          (currentRow.content.length === 0 && deleteConfig.attachments) ||
          (currentRow.attachments.length === 0 && deleteConfig.messages);
        const shouldEdit = deleteConfig.attachments || deleteConfig.messages;

        if (shouldDelete && !getState().app.discrubCancelled) {
          const success = await dispatch(
            deleteMessage(new Message({ ...currentRow }))
          );

          if (!success) {
            await dispatch(
              notify({
                message: "You do not have permission to modify this message!",
                timeout: 2,
              })
            );
          }
        } else if (shouldEdit && !getState().app.discrubCancelled) {
          const success = await dispatch(
            updateMessage(
              Object.assign(
                new Message({ ...currentRow }),
                deleteConfig.attachments ? { attachments: [] } : { content: "" }
              )
            )
          );
          if (!success) {
            await dispatch(
              notify({
                message: "You do not have permission to modify this message!",
                timeout: 2,
              })
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
};

const _fetchReactingUserIds =
  (
    message: Message,
    encodedEmoji: string
  ): AppThunk<Promise<ExportReaction[]>> =>
  async (dispatch, getState) => {
    const exportReactions: ExportReaction[] = [];
    const { token } = getState().user;

    for (const type of [ReactionType.NORMAL, ReactionType.BURST]) {
      let reachedEnd = false;
      let lastId = null;
      while (!reachedEnd) {
        if (getState().app.discrubCancelled || !token) break;
        await dispatch(checkDiscrubPaused());
        const { success, data } = await getReactions(
          token,
          message.channel_id,
          message.id,
          encodedEmoji,
          type,
          lastId
        );
        if (success && data && data.length) {
          data.forEach((u) =>
            exportReactions.push({
              id: u.id,
              burst: type === ReactionType.BURST,
            })
          );
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
    for (const message of messages) {
      reactionMap[message.id] = {};
      if (getState().app.discrubCancelled) break;
      await dispatch(checkDiscrubPaused());

      if (message.reactions?.length && token) {
        dispatch(setLookupReactionMessageId(message.id));
        for (const reaction of message.reactions) {
          const encodedEmoji = getEncodedEmoji(reaction.emoji);
          if (getState().app.discrubCancelled || !encodedEmoji) break;
          await dispatch(checkDiscrubPaused());

          reactionMap[message.id][encodedEmoji] = await dispatch(
            _fetchReactingUserIds(message, encodedEmoji)
          );
        }
      }
    }
    dispatch(setLookupReactionMessageId(null));
    dispatch(setExportReactionMap(reactionMap));
  };

export const getMessageData =
  (
    guildId: Snowflake | Maybe,
    channelId: Snowflake | Maybe,
    preFilterUserId: Snowflake | Maybe
  ): AppThunk<Promise<MessageData | void>> =>
  async (dispatch, getState) => {
    dispatch(resetMessageData());
    const { token } = getState().user;
    const {
      searchBeforeDate,
      searchAfterDate,
      searchMessageContent,
      selectedHasTypes,
    } = getState().message;

    if (token) {
      dispatch(setIsLoading(true));

      let retArr: Message[] = [];
      let retThreads: Channel[] = [];

      const criteriaExists = [
        preFilterUserId,
        searchBeforeDate,
        searchAfterDate,
        searchMessageContent,
        selectedHasTypes.length,
      ].some((c) => c);

      if (criteriaExists) {
        ({ messages: retArr, threads: retThreads } = await dispatch(
          _getSearchMessages(channelId, guildId, {
            preFilterUserId,
            searchBeforeDate,
            searchAfterDate,
            searchMessageContent,
            selectedHasTypes,
          })
        ));
      } else if (channelId) {
        ({ messages: retArr, threads: retThreads } = await dispatch(
          _getMessages(channelId)
        ));
      }

      let payload: MessageData = {
        threads: [],
        messages: [],
      };

      if (!getState().app.discrubCancelled) {
        await dispatch(_generateReactionMap(retArr));
        const userMap = dispatch(_getUserMap(retArr));
        await dispatch(_collectUserNames(userMap));
        if (guildId) {
          await dispatch(_collectUserGuildData(userMap, guildId));
          dispatch(getPreFilterUsers(guildId));
        }

        if (!getState().app.discrubCancelled) {
          payload = {
            threads: retThreads,
            messages: retArr,
          };
        }
      }
      const sortedMessages = payload.messages
        .map((m) => new Message({ ...m }))
        .sort((a, b) =>
          sortByProperty(
            Object.assign(a, { date: new Date(a.timestamp) }),
            Object.assign(b, { date: new Date(b.timestamp) }),
            "date",
            "desc"
          )
        );
      dispatch(setThreads(payload.threads));
      dispatch(setMessages(sortedMessages));
      dispatch(setIsLoading(false));
      dispatch(setLookupUserId(null));
      dispatch(resetFetchProgress());
      dispatch(setTotalSearchMessages(0));

      const { active, entity } = getState().app.modify;
      const { isGenerating, isExporting } = getState().export;
      const purgingOrExporting = [
        active,
        entity,
        isGenerating,
        isExporting,
      ].some((c) => !!c);

      if (!purgingOrExporting) {
        // If we are purging or exporting, we need to allow those respective slices to handle this.
        dispatch(setDiscrubCancelled(false));
      }

      return payload;
    }
  };

/**
 *
 * @param {Array} messages Array of Message entities
 * @returns Object mapping of the relevant Users from the messages param
 */
const _getUserMap =
  (messages: Message[]): AppThunk<ExportUserMap> =>
  (_, getState) => {
    const { userMap: existingUserMap, reactionMap } =
      getState().export.exportMaps;
    const defaultMapping = {
      userName: null,
      displayName: null,
      avatar: null,
      guilds: {},
    };
    const userMap: ExportUserMap = {};

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
          const userId = userMentionGroups?.user_id;
          if (userId && !userMap[userId]) {
            userMap[userId] = existingUserMap[userId] || defaultMapping;
          }
        }
      );

      for (const reaction of message.reactions || []) {
        const encodedEmoji = getEncodedEmoji(reaction.emoji);
        if (encodedEmoji) {
          const exportReactions = reactionMap[message.id][encodedEmoji] || [];
          exportReactions.forEach(({ id: uId }) => {
            if (!userMap[uId])
              userMap[uId] = existingUserMap[userId] || defaultMapping;
          });
        }
      }
    });

    return userMap;
  };

const _collectUserNames =
  (userMap: ExportUserMap): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { token } = getState().user;
    const { userMap: existingUserMap } = getState().export.exportMaps;
    const updateMap = { ...userMap };

    if (token) {
      for (const userId of Object.keys(updateMap)) {
        if (getState().app.discrubCancelled) break;
        await dispatch(checkDiscrubPaused());
        const mapping = existingUserMap[userId] || updateMap[userId];
        const { userName, displayName } = mapping;
        if (!userName && !displayName) {
          dispatch(setLookupUserId(userId));
          const { success, data } = await getUser(token, userId);
          if (success && data) {
            updateMap[userId] = {
              ...mapping,
              userName: data.username,
              displayName: data.global_name,
              avatar: data.avatar,
            };
          } else {
            const errorMsg = `Unable to retrieve data from userId: ${userId}`;
            console.error(errorMsg);
          }
        }
      }

      dispatch(setExportUserMap({ ...existingUserMap, ...updateMap }));
    }
  };

const _collectUserGuildData =
  (userMap: ExportUserMap, guildId: Snowflake): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { token } = getState().user;
    const { userMap: existingUserMap } = getState().export.exportMaps;
    const updateMap = { ...userMap };

    if (token) {
      for (const userId of Object.keys(updateMap)) {
        if (getState().app.discrubCancelled) break;
        await dispatch(checkDiscrubPaused());
        const userMapping = existingUserMap[userId] || updateMap[userId];
        const userGuilds = userMapping.guilds;
        if (!userGuilds[guildId]) {
          dispatch(setLookupUserId(userId));
          const { success, data } = await fetchGuildUser(
            guildId,
            userId,
            token
          );

          if (success && data) {
            updateMap[userId] = {
              ...userMapping,
              guilds: {
                ...userGuilds,
                [guildId]: {
                  roles: data.roles,
                  nick: data.nick,
                  joinedAt: format(parseISO(data.joined_at), "MMM d, yyyy"),
                },
              },
            };
          } else {
            const errorMsg = `Unable to retrieve guild user data from userId ${userId} and guildId ${guildId}`;
            console.error(errorMsg);
            updateMap[userId] = {
              ...userMapping,
              guilds: {
                ...userGuilds,
                [guildId]: { roles: [], nick: null, joinedAt: null },
              },
            };
          }
        }
      }

      dispatch(setExportUserMap({ ...existingUserMap, ...updateMap }));
    }
  };

const _resolveMessageReactions =
  (messages: Message[]): AppThunk<Promise<Message[]>> =>
  async (dispatch, getState) => {
    const { token } = getState().user;
    const trackMap: Record<Snowflake, Reaction[]> = {};
    let retArr: Message[] = [...messages];

    if (token) {
      for (const message of messages) {
        if (getState().app.discrubCancelled) break;
        await dispatch(checkDiscrubPaused());

        if (!trackMap[message.id]) {
          const { success, data } = await fetchMessageData(
            token,
            message.id,
            message.channel_id,
            QueryStringParam.AROUND
          );

          if (success && data) {
            data.forEach((m) => {
              trackMap[m.id] = m.reactions || [];
            });
          }
        }
      }
      retArr = messages.map((message) => ({
        ...message,
        reactions: trackMap[message.id],
      }));
    }

    return retArr;
  };

const _getSearchMessages =
  (
    channelId: Snowflake | Maybe,
    guildId: Snowflake | Maybe,
    searchCriteria: SearchMessageProps
  ): AppThunk<Promise<MessageData>> =>
  async (dispatch, getState) => {
    const { token } = getState().user;
    let retArr: Message[] = [];
    const retThreads: Channel[] = [];

    if (token) {
      let offset = 0;
      let reachedEnd = false;
      let criteria = { ...searchCriteria };
      let totalMessages = 0;
      while (!reachedEnd) {
        await dispatch(checkDiscrubPaused());
        if (getState().app.discrubCancelled) break;

        const { success, data } = await fetchSearchMessageData(
          token,
          offset,
          channelId,
          guildId,
          criteria
        );

        if (success && data) {
          const { total_results, messages = [], threads = [] } = data || {};
          if (!totalMessages && total_results) {
            totalMessages = total_results;
          }
          if (messages.length === 0) break;
          for (const th of threads)
            if (!retThreads.find((eTh) => eTh.id === th.id))
              retThreads.push(th);
          const foundMessages = messages.flat();
          // Max offset is 5000, need to reset offset and update/set searchBeforeDate
          if (offset === 5000) {
            const { timestamp } = foundMessages[foundMessages.length - 1];
            criteria = { ...criteria, searchBeforeDate: parseISO(timestamp) };
            offset = 0;
          } else if (offset >= total_results) reachedEnd = true;
          else offset += 25;

          for (const m of foundMessages) {
            if (_messageTypeAllowed(m.type)) retArr.push(m);
          }
          dispatch(
            setFetchProgress({
              messageCount: retArr.length,
              channelId,
              threadCount: retThreads.length,
            })
          );
          dispatch(setTotalSearchMessages(totalMessages));
        } else {
          reachedEnd = true;
        }
      }

      retArr = await dispatch(_resolveMessageReactions(retArr));
    }
    return {
      messages: retArr,
      threads: retThreads,
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
  ].some((t) => t === type);
};

const _getMessages =
  (channelId: Snowflake): AppThunk<Promise<MessageData>> =>
  async (dispatch, getState) => {
    const { channels } = getState().channel;
    const { dms } = getState().dm;
    const channel =
      channels.find((c) => channelId === c.id) ||
      dms.find((d) => channelId === d.id);
    const trackedThreads: Channel[] = [];
    const messages: Message[] = [];

    if (channel) {
      const isGuildForum = [
        ChannelType.GUILD_FORUM,
        ChannelType.GUILD_MEDIA,
      ].some((type) => type === channel.type);

      if (isGuildForum) {
        dispatch(setFetchProgress({ parsingThreads: true }));
        const { threads } = await dispatch(
          _getSearchMessages(channelId, channel.guild_id, {})
        );
        dispatch(resetFetchProgress());
        threads.forEach((t) => {
          if (!trackedThreads.some((tt) => tt.id === t.id)) {
            trackedThreads.push(t);
          }
        });
      } else {
        (await dispatch(_getMessagesFromChannel(channelId))).forEach((m) =>
          messages.push(m)
        );
      }

      if (!isDm(channel)) {
        const threadsFromMessages = getThreadsFromMessages({
          messages,
          knownThreads: trackedThreads,
        });
        threadsFromMessages.forEach((ft) => trackedThreads.push(ft));

        const archivedThreads = await dispatch(
          getArchivedThreads({ channelId, knownThreads: trackedThreads })
        );
        archivedThreads.forEach((at) => trackedThreads.push(at));

        for (const thread of trackedThreads) {
          (await dispatch(_getMessagesFromChannel(thread.id))).forEach((m) =>
            messages.push(m)
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
    const { token } = getState().user;
    let lastId = "";
    let reachedEnd = false;
    const messages: Message[] = [];

    if (token) {
      while (!reachedEnd) {
        if (getState().app.discrubCancelled) break;
        await dispatch(checkDiscrubPaused());
        const { success, data } = await fetchMessageData(
          token,
          lastId,
          channelId
        );

        if (success && data) {
          if (data.length < 100) reachedEnd = true;
          if (data.length > 0) lastId = data[data.length - 1].id;
          const hasValidMessages = Boolean(
            data[0]?.content || data[0]?.attachments
          );
          if (hasValidMessages) {
            const { fetchProgress } = getState().message;
            const { messageCount } = fetchProgress;
            dispatch(
              setFetchProgress({
                messageCount: data.length + messageCount,
                channelId,
              })
            );
            data
              .filter((m) => _messageTypeAllowed(m.type))
              .forEach((m) => messages.push(m));
          }
        } else {
          break;
        }
      }
    }

    return messages;
  };

export default messageSlice.reducer;
