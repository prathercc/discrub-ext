import { createSlice } from "@reduxjs/toolkit";
import {
  editMessage as editMsg,
  deleteMessage as delMsg,
  getUser,
  fetchSearchMessageData,
  fetchMessageData,
} from "../../services/discordService";
import { sortByProperty, wait } from "../../utils";
import parseISO from "date-fns/parseISO";
import Message from "../../classes/Message";
import { MessageType } from "../../enum/MessageType";
import Thread from "../../classes/Thread";
import {
  getArchivedThreads,
  getThreadsFromMessages,
  liftThreadRestrictions,
  resetThreads,
  setThreads,
} from "../thread/threadSlice";
import {
  checkDiscrubPaused,
  getDiscrubCancelled,
  resetModify,
  setDiscrubCancelled,
  setIsModifying,
  setModifyEntity,
  setTimeoutMessage as notify,
} from "../app/appSlice";

const _descendingComparator = (a, b, orderBy) => {
  return b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0;
};

export const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [], // Message objects
    selectedMessages: [], // Array of id
    filteredMessages: [], // Message objects
    filters: [], // Array of object filters
    fetchedMessageLength: 0, // Current length of fetched messages, used for debugging message fetch progress
    lookupUserId: null, // The userId being looked up (during message fetch process)
    isLoading: null,
    order: "asc",
    orderBy: "",
    searchBeforeDate: null,
    searchAfterDate: null,
    totalSearchMessages: 0,
    searchMessageContent: null,
    hasTypes: ["embed", "file", "image", "link", "sound", "sticker", "video"],
    selectedHasTypes: [],
  },
  reducers: {
    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setSelectedHasTypes: (state, { payload }) => {
      state.selectedHasTypes = payload;
    },
    setSearchMessageContent: (state, { payload }) => {
      state.searchMessageContent = payload;
    },
    setSearchBeforeDate: (state, { payload }) => {
      state.searchBeforeDate = payload;
    },
    setSearchAfterDate: (state, { payload }) => {
      state.searchAfterDate = payload;
    },
    setSelected: (state, { payload }) => {
      state.selectedMessages = payload;
    },
    setOrder: (state, { payload }) => {
      const { order, orderBy } = payload; // Ensure params are passed as a single object
      state.order = order;
      state.orderBy = orderBy;
      state.messages = state.messages.sort(
        payload.order === "desc"
          ? (a, b) => _descendingComparator(a, b, orderBy)
          : (a, b) => -_descendingComparator(a, b, orderBy)
      );
      state.filteredMessages = state.filteredMessages.sort(
        payload.order === "desc"
          ? (a, b) => _descendingComparator(a, b, orderBy)
          : (a, b) => -_descendingComparator(a, b, orderBy)
      );
    },
    setMessages: (state, { payload }) => {
      state.messages = payload;
    },
    setFilteredMessages: (state, { payload }) => {
      state.filteredMessages = payload;
    },
    _resetMessageData: (state, { payload }) => {
      state.messages = [];
      state.selectedMessages = [];
      state.lookupUserId = null;
      state.fetchedMessageLength = 0;
      state.totalSearchMessages = 0;
      state.isLoading = null;
    },
    setLookupUserId: (state, { payload }) => {
      state.lookupUserId = payload;
    },
    setFetchedMessageLength: (state, { payload }) => {
      state.fetchedMessageLength = payload;
    },
    setTotalSearchMessages: (state, { payload }) => {
      state.totalSearchMessages = payload;
    },
    resetFilters: (state, { payload }) => {
      state.filters = [];
      state.filteredMessages = [];
    },
    resetAdvancedFilters: (state, { payload }) => {
      state.searchBeforeDate = null;
      state.searchAfterDate = null;
      state.searchMessageContent = null;
      state.selectedHasTypes = [];
    },
    updateFilters: (state, { payload }) => {
      const { filterName, filterValue, filterType } = payload;
      let filteredList = state.filters.filter(
        (x) => x.filterName !== filterName
      );
      let retFilters = [];
      if (filterType === "text") {
        if (filterValue.length > 0)
          retFilters = [
            ...filteredList,
            {
              filterName: filterName,
              filterValue: filterValue,
              filterType: filterType,
            },
          ];
        else retFilters = [...filteredList];
      } else if (filterType === "date") {
        if (filterValue !== null && filterValue !== "Invalid Date") {
          retFilters = [
            ...filteredList,
            {
              filterName: filterName,
              filterValue: filterValue,
              filterType: filterType,
            },
          ];
        } else retFilters = [...filteredList];
      } else if (filterType === "thread") {
        if (filterValue?.length > 0)
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
      } else if (filterType === "toggle") {
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
    filterMessages: (state, { payload }) => {
      let retArr = [];
      const inverseActive = state.filters.some(
        (filter) => filter.filterName === "inverse"
      );
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
            if (criteriaMet) {
              if (param.filterType === "text") {
                if (param.filterName === "attachmentName") {
                  criteriaMet = _filterAttachmentName(
                    param.filterValue,
                    x,
                    inverseActive
                  );
                } else if (param.filterName === "content") {
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
              } else if (param.filterType === "date") {
                if (param.filterName === "startTime") {
                  criteriaMet = _filterStartTime(
                    param.filterValue,
                    x,
                    inverseActive
                  );
                } else if (param.filterName === "endTime") {
                  criteriaMet = _filterEndTime(
                    param.filterValue,
                    x,
                    inverseActive
                  );
                }
              } else if (param.filterType === "thread") {
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

const _filterThread = (filterValue, message, inverseActive) => {
  const { channel_id, thread } = message;
  const isFromThread = channel_id === filterValue || thread?.id === filterValue;

  const criteriaMet =
    (!inverseActive && !isFromThread) || (inverseActive && isFromThread);

  if (criteriaMet) {
    return false;
  }
  return true;
};

const _filterEndTime = (filterValue, message, inverseActive) => {
  const endTime = Date.parse(filterValue);
  const rowTime = Date.parse(message.timestamp);

  const criteriaMet =
    (!inverseActive && rowTime > endTime) ||
    (inverseActive && !(rowTime > endTime));

  if (criteriaMet) {
    return false;
  }
  return true;
};

const _filterStartTime = (filterValue, message, inverseActive) => {
  const startTime = Date.parse(filterValue);
  const rowTime = Date.parse(message.timestamp);

  const criteriaMet =
    (!inverseActive && rowTime < startTime) ||
    (inverseActive && !(rowTime < startTime));

  if (criteriaMet) {
    return false;
  }
  return true;
};

const _filterText = (filterName, filterValue, message, inverseActive) => {
  const textContainsValue = message[filterName]
    ?.toLowerCase()
    ?.includes(filterValue);

  const criteriaMet =
    (!inverseActive && !textContainsValue) ||
    (inverseActive && textContainsValue);

  if (criteriaMet) {
    return false;
  }
  return true;
};

const _filterAttachmentName = (filterValue, message, inverseActive) => {
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

const _filterMessageContent = (fv, message, inverseActive) => {
  const filterValue = fv.toLowerCase();
  const contentContainsValue = message.content
    ?.toLowerCase()
    ?.includes(filterValue);
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
        ].some((prop) => prop?.toLowerCase()?.includes(filterValue)) ||
          fields?.some((field) =>
            [field?.name, field?.value].some((fieldProp) =>
              fieldProp?.toLowerCase()?.includes(filterValue)
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
  setFetchedMessageLength,
  setTotalSearchMessages,
  resetFilters,
  resetAdvancedFilters,
  updateFilters,
  filterMessages,
} = messageSlice.actions;

export const selectMessage = (state) => state.message;

export const deleteAttachment = (attachment) => async (dispatch, getState) => {
  const { entity: message } = getState().app.modify;
  const shouldEdit =
    (message.content && message.content.length > 0) ||
    message.attachments.length > 1;

  await dispatch(liftThreadRestrictions(message.getChannelId()));

  try {
    dispatch(setIsModifying(true));
    if (shouldEdit) {
      const updatedMessage = Object.assign(message.getSafeCopy(), {
        attachments: message.attachments.filter(
          (attch) => attch.id !== attachment.id
        ),
      });
      const response = await dispatch(updateMessage(updatedMessage));
      if (response !== null) {
        await dispatch(
          notify("Entire message must be deleted to remove attachment!", 0.5)
        );
      } else {
        dispatch(setModifyEntity(updatedMessage));
      }
    } else {
      const response = await dispatch(deleteMessage(message));
      if (response !== null) {
        await dispatch(
          notify("You do not have permission to delete this attachment!", 0.5)
        );
      } else {
        dispatch(setModifyEntity(null));
      }
    }
    dispatch(setIsModifying(false));
  } catch (e) {
    console.error("Failed to delete attachment", e, attachment);
    dispatch(resetModify());
  }
};

export const updateMessage = (message) => async (dispatch, getState) => {
  const { token } = getState().user;
  try {
    const data = await editMsg(
      token,
      message.id,
      { content: message.content, attachments: message.attachments },
      message.channel_id
    );
    if (!data.message) {
      const { modify } = getState().app;
      const { messages, filteredMessages } = getState().message;
      const { entity: modifyMessage } = modify;
      const updatedMessages = messages.map((message) =>
        message.id === data.id
          ? Object.assign(new Message(data), { username: message.username })
          : message
      );
      const updatedFilterMessages = filteredMessages.map((message) =>
        message.id === data.id
          ? Object.assign(new Message(data), { username: message.username })
          : message
      );
      const updatedModifyMessage =
        modifyMessage?.id === data.id
          ? Object.assign(new Message(data), {
              username: modifyMessage.username,
            })
          : modifyMessage;

      dispatch(setMessages(updatedMessages));
      dispatch(setFilteredMessages(updatedFilterMessages));
      dispatch(setModifyEntity(updatedModifyMessage));

      return null;
    } else if (data.retry_after) {
      return data.retry_after;
    } else {
      return -1;
    }
  } catch (e) {
    console.error("Failed to update message", e, message);
    return -1;
  }
};

export const editMessages =
  (messages, updateText) => async (dispatch, getState) => {
    dispatch(setIsModifying(true));
    let count = 0;
    let noPermissionThreadIds = [];
    while (count < messages.length && !dispatch(getDiscrubCancelled())) {
      await dispatch(checkDiscrubPaused());
      const currentMessage = messages[count];

      noPermissionThreadIds = await dispatch(
        liftThreadRestrictions(
          currentMessage.getChannelId(),
          noPermissionThreadIds
        )
      );

      dispatch(setModifyEntity(currentMessage));

      const noPermissionSkip = noPermissionThreadIds.some(
        (tId) => tId === currentMessage.getChannelId()
      );
      if (noPermissionSkip) {
        await dispatch(
          notify("Permission missing for message, skipping edit", 1)
        );
        count++;
      } else {
        let response = null;

        if (!dispatch(getDiscrubCancelled())) {
          response = await dispatch(
            updateMessage(
              Object.assign(currentMessage.getSafeCopy(), {
                content: updateText,
              })
            )
          );
        }

        if (response === null) {
          count++;
        } else if (response > 0) {
          await dispatch(
            notify(`Pausing for ${response} seconds...`, response)
          );
        } else {
          await dispatch(
            notify("You do not have permission to modify this message!", 2)
          );
          count++;
        }
      }
    }
    dispatch(resetModify());
    dispatch(setDiscrubCancelled(false));
  };

export const deleteMessage = (message) => async (dispatch, getState) => {
  const { token } = getState().user;
  try {
    const response = await delMsg(token, message.id, message.channel_id);
    if (response.status === 204) {
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

      return null;
    } else if (response.retry_after) {
      return response.retry_after;
    } else {
      return -1;
    }
  } catch (e) {
    console.error("Failed to delete message", e, message);
    return -1;
  }
};

export const deleteMessages =
  (
    messages,
    deleteConfig = {
      attachments: true,
      messages: true,
    }
  ) =>
  async (dispatch, getState) => {
    dispatch(setIsModifying(true));
    let count = 0;
    let noPermissionThreadIds = [];
    while (count < messages.length && !dispatch(getDiscrubCancelled())) {
      await dispatch(checkDiscrubPaused());
      const currentRow = messages[count];

      noPermissionThreadIds = await dispatch(
        liftThreadRestrictions(currentRow.getChannelId(), noPermissionThreadIds)
      );

      dispatch(
        setModifyEntity(
          Object.assign(currentRow.getSafeCopy(), {
            _index: count + 1,
            _total: messages.length,
          })
        )
      );
      const noPermissionSkip = noPermissionThreadIds.some(
        (tId) => tId === currentRow.getChannelId()
      );
      if (noPermissionSkip) {
        await dispatch(
          notify("Permission missing for message, skipping delete", 1)
        );
        count++;
      } else {
        const shouldDelete =
          (deleteConfig.attachments && deleteConfig.messages) ||
          (currentRow.content.length === 0 && deleteConfig.attachments) ||
          (currentRow.attachments.length === 0 && deleteConfig.messages);
        const shouldEdit = deleteConfig.attachments || deleteConfig.messages;

        if (shouldDelete && !dispatch(getDiscrubCancelled())) {
          const response = await dispatch(
            deleteMessage(currentRow.getSafeCopy())
          );
          if (response === null) {
            count++;
          } else if (response > 0) {
            await dispatch(
              notify(`Pausing for ${response} seconds...`, response)
            );
          } else {
            await dispatch(
              notify("You do not have permission to modify this message!", 2)
            );
            count++;
          }
        } else if (shouldEdit && !dispatch(getDiscrubCancelled())) {
          const response = await dispatch(
            updateMessage(
              Object.assign(
                currentRow.getSafeCopy(),
                deleteConfig.attachments ? { attachments: [] } : { content: "" }
              )
            )
          );
          if (response === null) {
            count++;
          } else if (response > 0) {
            await dispatch(
              notify(`Pausing for ${response} seconds...`, response)
            );
          } else {
            await dispatch(
              notify("You do not have permission to modify this message!", 2)
            );
            count++;
          }
        } else break;
      }
    }
    dispatch(resetModify());
    dispatch(setDiscrubCancelled(false));
  };

export const resetMessageData = () => (dispatch, getState) => {
  dispatch(_resetMessageData());
  dispatch(resetThreads());
};

export const getMessageData =
  (guildId, channelId, preFilterUserId) => async (dispatch, getState) => {
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

      let retArr = [];
      let retThreads = [];

      const criteriaExists = [
        preFilterUserId,
        searchBeforeDate,
        searchAfterDate,
        searchMessageContent,
        selectedHasTypes.length,
      ].some((c) => c);

      if (criteriaExists) {
        ({ retArr, retThreads } = await dispatch(
          _getSearchMessages(channelId, guildId, {
            preFilterUserId,
            searchBeforeDate,
            searchAfterDate,
            searchMessageContent,
            selectedHasTypes,
          })
        ));
      } else {
        ({ retArr, retThreads } = await dispatch(_getMessages(channelId)));
      }

      let payload = {
        threads: [],
        messages: [],
      };

      if (!dispatch(getDiscrubCancelled())) {
        const messagesWithMentions = await dispatch(_parseMentions(retArr));

        payload = {
          threads: retThreads,
          messages: messagesWithMentions,
        };
      }
      const sortedMessages = payload.messages.toSorted((a, b) =>
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
      dispatch(setFetchedMessageLength(0));
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

const _parseMentions = (messages) => async (dispatch, getState) => {
  const { token } = getState().user;
  const userMap = {};
  const regex = /<@[0-9]+>|<@&[0-9]+>|<@![0-9]+>/g;

  messages.forEach((msg) => {
    msg.content
      .match(regex)
      ?.map((mention) =>
        mention
          .replace("<@!", "")
          .replace("<@&", "")
          .replace("<@", "")
          .replace(">", "")
      )
      ?.forEach((mention) => (userMap[mention] = null));
  });

  let count = 0;
  const keys = Object.keys(userMap);
  while (count < keys.length) {
    if (dispatch(getDiscrubCancelled())) break;
    await dispatch(checkDiscrubPaused());
    const mentionedUserId = keys[count];
    try {
      dispatch(setLookupUserId(mentionedUserId));
      const { id, retry_after, username } = await getUser(
        token,
        mentionedUserId
      );
      if (!id && !retry_after) {
        console.error("Unable to retrieve data from userId: ", mentionedUserId);
        count++;
      } else if (retry_after) {
        await wait(retry_after);
        console.warn(
          `You are being rate limited, waiting: ${retry_after} seconds.`
        );
        continue;
      } else {
        userMap[mentionedUserId] = username;
        count++;
      }
    } catch (e) {
      console.error("Failed to fetch user by id", e, mentionedUserId);
      count++;
    }
  }
  return messages.map((msg) =>
    Object.assign(msg, {
      content: Object.keys(userMap).reduce((acc, curr) => {
        const keyValue = userMap[curr];
        return acc
          .replaceAll(`<@${curr}>`, `@${keyValue}`)
          .replaceAll(`<@!${curr}>`, `@${keyValue}`)
          .replaceAll(`<@&${curr}>`, `@${keyValue}`);
      }, msg.content),
      username: msg.author.username,
    })
  );
};

const _getSearchMessages =
  (channelId, guildId, searchCriteria) => async (dispatch, getState) => {
    const { token } = getState().user;
    let retArr = [];
    let retThreads = [];
    try {
      let offset = 0;
      let reachedEnd = false;
      let criteria = { ...searchCriteria };
      let totalMessages = null;
      while (!reachedEnd) {
        await dispatch(checkDiscrubPaused());
        if (dispatch(getDiscrubCancelled())) break;

        const data = await fetchSearchMessageData(
          token,
          offset,
          channelId,
          guildId,
          criteria
        );

        const { total_results, retry_after, messages, threads } = data || {};
        if (!totalMessages && total_results) {
          totalMessages = total_results;
        }

        if (retry_after) {
          await wait(retry_after);
          continue;
        }
        if (!data || messages?.length === 0) break;
        if (threads)
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
        dispatch(setFetchedMessageLength(retArr.length));
        dispatch(setTotalSearchMessages(totalMessages));
      }
    } catch (e) {
      console.error("Failed to fetch messages", e);
    } finally {
      return {
        retArr: retArr.map((m) => new Message(m)),
        retThreads: retThreads.map((rt) => new Thread(rt)),
      };
    }
  };

const _messageTypeAllowed = (type) => {
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

const _getMessages = (channelId) => async (dispatch, getState) => {
  const { channels } = getState().channel;
  const { dms } = getState().dm;
  const channel =
    channels.find((c) => channelId === c.id) ||
    dms.find((d) => channelId === d.id);
  const trackedThreads = [];
  const messages = [];

  try {
    if (channel.isGuildForum()) {
      const { retThreads: threads } = await dispatch(
        _getSearchMessages(channelId, channel.getGuildId(), {})
      );
      threads.forEach((t) => {
        if (!trackedThreads.some((tt) => tt.id === t.id)) {
          trackedThreads.push(new Thread(t));
        }
      });
    } else {
      (await dispatch(_getMessagesFromChannel(channelId))).forEach((m) =>
        messages.push(m)
      );
    }

    if (!channel.isDm()) {
      const threadsFromMessages = getThreadsFromMessages(
        messages,
        trackedThreads
      );
      threadsFromMessages.forEach((ft) => trackedThreads.push(ft));

      const archivedThreads = await dispatch(
        getArchivedThreads(channelId, trackedThreads)
      );
      archivedThreads.forEach((at) => trackedThreads.push(at));

      for (const thread of trackedThreads) {
        (await dispatch(_getMessagesFromChannel(thread.getId()))).forEach((m) =>
          messages.push(m)
        );
      }
    }
  } catch (e) {
    console.error("Failed to fetch messages", e);
  } finally {
    return {
      retArr: messages.map((m) => new Message(m)),
      retThreads: trackedThreads,
    };
  }
};

const _getMessagesFromChannel = (channelId) => async (dispatch, getState) => {
  const { token } = getState().user;
  let lastId = "";
  let reachedEnd = false;
  const messages = [];
  while (!reachedEnd) {
    if (dispatch(getDiscrubCancelled())) break;
    await dispatch(checkDiscrubPaused());
    const data = await fetchMessageData(token, lastId, channelId);
    if (data.message && data.message.includes("Missing Access")) break;
    if (data.length < 100) reachedEnd = true;
    if (data.length > 0) lastId = data[data.length - 1].id;
    const hasValidMessages = data && (data[0]?.content || data[0]?.attachments);
    if (hasValidMessages) {
      const { fetchedMessageLength } = getState().message;
      dispatch(setFetchedMessageLength(data.length + fetchedMessageLength));
      data
        .filter((m) => _messageTypeAllowed(m.type))
        .forEach((m) => messages.push(m));
    }
  }
  return messages;
};

export default messageSlice.reducer;
