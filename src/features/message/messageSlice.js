import { createSlice } from "@reduxjs/toolkit";
import {
  editMessage as editMsg,
  deleteMessage as delMsg,
  getUser,
  fetchSearchMessageData,
  fetchMessageData,
  fetchThreads,
} from "../../services/discordService";
import { wait } from "../../utils";
import parseISO from "date-fns/parseISO";
import Message from "../../classes/Message";

const _descendingComparator = (a, b, orderBy) => {
  return b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0;
};

const defaultModify = {
  active: false,
  message: null,
  statusText: null,
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
    threads: [], // The list of threads for a given messages arr
    order: "asc",
    orderBy: "",
    searchBeforeDate: null,
    searchAfterDate: null,
    totalSearchMessages: 0,
    searchMessageContent: null,
    hasTypes: ["embed", "file", "image", "link", "sound", "sticker", "video"],
    selectedHasTypes: [],
    discrubPaused: false, // Flag to pause Export/Purge/Search
    discrubCancelled: false, // Flag to cancel Export/Purge/Search
    modify: defaultModify,
  },
  reducers: {
    setIsLoading: (state, { payload }) => {
      state.isLoading = payload;
    },

    setIsModifying: (state, { payload }) => {
      state.modify.active = payload;
    },
    setModifyMessage: (state, { payload }) => {
      state.modify.message = payload;
    },
    setModifyStatusText: (state, { payload }) => {
      state.modify.statusText = payload;
    },
    resetModifyStatusText: (state, { payload }) => {
      state.modify.statusText = "";
    },
    resetModify: (state, { payload }) => {
      state.modify = defaultModify;
    },

    setDiscrubPaused: (state, { payload }) => {
      state.discrubPaused = payload;
    },
    setDiscrubCancelled: (state, { payload }) => {
      state.discrubCancelled = payload;
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
    setThreads: (state, { payload }) => {
      state.threads = payload;
    },
    setFilteredMessages: (state, { payload }) => {
      state.filteredMessages = payload;
    },
    resetMessageData: (state, { payload }) => {
      state.messages = [];
      state.selectedMessages = [];
      state.lookupUserId = null;
      state.fetchedMessageLength = 0;
      state.totalSearchMessages = 0;
      state.isLoading = null;
      state.threads = [];
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
      }

      state.filters = retFilters;
    },
    filterMessages: (state, { payload }) => {
      let retArr = [];
      state.messages.forEach((x) => {
        let criteriaMet = true;
        state.filters.forEach((param) => {
          if (param.filterType === "text") {
            if (param.filterName === "attachmentName") {
              let csvAttachments = "";
              x.attachments.forEach((attachment) => {
                csvAttachments += attachment.filename + ",";
              });
              if (
                !csvAttachments
                  .toLowerCase()
                  .includes(param.filterValue.toLowerCase())
              ) {
                criteriaMet = false;
              }
            } else if (param.filterName === "content") {
              const messageContent = x[param.filterName].toLowerCase();
              const filterValue = param.filterValue.toLowerCase();
              const embedsContainFilter = () => {
                if (x.embeds) {
                  return x.embeds.some((embed) => {
                    const {
                      author,
                      description,
                      fields,
                      footer,
                      title,
                      type,
                      url,
                    } = embed || {};
                    return (
                      type === "rich" &&
                      (author?.name?.toLowerCase()?.includes(filterValue) ||
                        author?.url?.toLowerCase()?.includes(filterValue) ||
                        description?.toLowerCase()?.includes(filterValue) ||
                        footer?.text?.toLowerCase()?.includes(filterValue) ||
                        title?.toLowerCase()?.includes(filterValue) ||
                        url?.toLowerCase()?.includes(filterValue) ||
                        fields?.some(
                          (field) =>
                            field?.name?.toLowerCase()?.includes(filterValue) ||
                            field?.value?.toLowerCase()?.includes(filterValue)
                        ))
                    );
                  });
                }
              };
              if (
                !messageContent.includes(filterValue) &&
                !embedsContainFilter()
              ) {
                criteriaMet = false;
              }
            } else {
              const rowValue = x[param.filterName].toLowerCase();
              const filterValue = param.filterValue.toLowerCase();
              if (!rowValue.includes(filterValue)) {
                criteriaMet = false;
              }
            }
            return criteriaMet;
          } else if (param.filterType === "date") {
            if (param.filterName === "startTime") {
              const startTime = Date.parse(param.filterValue);
              const rowTime = Date.parse(x.timestamp);
              if (rowTime < startTime) {
                criteriaMet = false;
              }
            } else if (param.filterName === "endTime") {
              const endTime = Date.parse(param.filterValue);
              const rowTime = Date.parse(x.timestamp);
              if (rowTime > endTime) {
                criteriaMet = false;
              }
            }
          } else if (param.filterType === "thread") {
            if (
              x.channel_id !== param.filterValue &&
              x.thread?.id !== param.filterValue
            ) {
              criteriaMet = false;
            }
          }
        });
        if (criteriaMet) retArr.push(x);
      });

      state.filteredMessages = retArr;
      state.selectedMessages = retArr
        .filter((m) => state.selectedMessages.some((mId) => m.id === mId))
        .map((m) => m.id);
    },
  },
});

export const {
  setIsLoading,

  setIsModifying,
  setModifyMessage,
  setModifyStatusText,
  resetModifyStatusText,
  resetModify,

  setDiscrubPaused,
  setDiscrubCancelled,

  setSelectedHasTypes,
  setSearchMessageContent,
  setSearchBeforeDate,
  setSearchAfterDate,

  setSelected,
  setOrder,
  setMessages,
  setThreads,
  setFilteredMessages,
  resetMessageData,
  setLookupUserId,
  setFetchedMessageLength,
  setTotalSearchMessages,
  resetFilters,
  resetAdvancedFilters,
  updateFilters,
  filterMessages,
} = messageSlice.actions;

export const selectMessage = (state) => state.message;

export const checkDiscrubPaused = () => async (dispatch, getState) => {
  while (getState().message.discrubPaused) await wait(2);
};

// TODO: Use discrubCancelled to stop any Search/Purge/Export
// Something that we can do here is disable the approriate buttons while this is true (once this flag gets reset to false, we reenable the buttons)
export const getDiscrubCancelled = () => (dispatch, getState) => {
  return getState().message.discrubCancelled;
};

export const deleteAttachment = (attachment) => async (dispatch, getState) => {
  const { message } = getState().message.modify;
  const shouldEdit =
    (message.content && message.content.length > 0) ||
    message.attachments.length > 1;
  dispatch(setIsModifying(true));
  if (shouldEdit) {
    const updatedMessage = Object.assign(message.getSafeCopy(), {
      attachments: message.attachments.filter(
        (attch) => attch.id !== attachment.id
      ),
    });
    const response = await dispatch(updateMessage(updatedMessage));
    if (response !== null) {
      dispatch(
        setModifyStatusText(
          "Entire message must be deleted to remove attachment!"
        )
      );
      await wait(0.5, () => dispatch(resetModifyStatusText()));
    } else {
      dispatch(setModifyMessage(updatedMessage));
    }
  } else {
    const response = await dispatch(deleteMessage(message));
    if (response !== null) {
      dispatch(
        setModifyStatusText(
          "You do not have permission to delete this attachment!"
        )
      );
      await wait(0.5, () => dispatch(resetModifyStatusText()));
    } else {
      dispatch(setModifyMessage(null));
    }
  }
  dispatch(setIsModifying(false));
};

export const updateMessage = (message) => async (dispatch, getState) => {
  const { token } = getState().user;
  const data = await editMsg(
    token,
    message.id,
    { content: message.content, attachments: message.attachments },
    message.channel_id
  );
  if (!data.message) {
    const { messages, filteredMessages, modify } = getState().message;
    const { message: modifyMessage } = modify;
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
        ? Object.assign(new Message(data), { username: modifyMessage.username })
        : modifyMessage;

    dispatch(setMessages(updatedMessages));
    dispatch(setFilteredMessages(updatedFilterMessages));
    dispatch(setModifyMessage(updatedModifyMessage));

    return null;
  } else if (data.retry_after) {
    return data.retry_after;
  } else {
    return -1;
  }
};

export const editMessages =
  (messages, updateText) => async (dispatch, getState) => {
    dispatch(setIsModifying(true));
    let count = 0;
    while (count < messages.length && !dispatch(getDiscrubCancelled())) {
      const currentMessage = messages[count];
      dispatch(setModifyMessage(currentMessage));

      const response = await dispatch(
        updateMessage(
          Object.assign(currentMessage.getSafeCopy(), {
            content: updateText,
          })
        )
      );
      if (response === null) {
        count++;
      } else if (response > 0) {
        dispatch(setModifyStatusText(`Pausing for ${response} seconds...`));
        await wait(response, () => dispatch(resetModifyStatusText()));
      } else {
        dispatch(
          setModifyStatusText(
            "You do not have permission to modify this message!"
          )
        );
        await wait(2, () => dispatch(resetModifyStatusText()));
        count++;
      }
    }
    dispatch(resetModify());
  };

export const deleteMessage = (message) => async (dispatch, getState) => {
  const { token } = getState().user;
  const response = await delMsg(token, message.id, message.channel_id);
  if (response.status === 204) {
    const { messages, filteredMessages, selectedMessages } = getState().message;
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
    while (count < messages.length && !dispatch(getDiscrubCancelled())) {
      const currentRow = messages[count];
      dispatch(
        setModifyMessage(
          Object.assign(currentRow.getSafeCopy(), {
            _index: count + 1,
            _total: messages.length,
          })
        )
      );
      if (
        (deleteConfig.attachments && deleteConfig.messages) ||
        (currentRow.content.length === 0 && deleteConfig.attachments) ||
        (currentRow.attachments.length === 0 && deleteConfig.messages)
      ) {
        const response = await dispatch(
          deleteMessage(currentRow.getSafeCopy())
        );
        if (response === null) {
          count++;
        } else if (response > 0) {
          dispatch(setModifyStatusText(`Pausing for ${response} seconds...`));
          await wait(response, () => dispatch(resetModifyStatusText()));
        } else {
          dispatch(
            setModifyStatusText(
              "You do not have permission to modify this message!"
            )
          );
          await wait(2, () => dispatch(resetModifyStatusText()));
          count++;
        }
      } else if (deleteConfig.attachments || deleteConfig.messages) {
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
          dispatch(setModifyStatusText(`Pausing for ${response} seconds...`));
          await wait(response, () => dispatch(resetModifyStatusText()));
        } else {
          dispatch(
            setModifyStatusText(
              "You do not have permission to modify this message!"
            )
          );
          await wait(2, () => dispatch(resetModifyStatusText()));
          count++;
        }
      } else break;
    }
    dispatch(resetModify());
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

      dispatch(setThreads(payload.threads));
      dispatch(setMessages(payload.messages));
      dispatch(setIsLoading(false));
      dispatch(setLookupUserId(null));
      dispatch(setFetchedMessageLength(0));
      dispatch(setTotalSearchMessages(0));
      dispatch(setDiscrubCancelled(false));

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
    await dispatch(checkDiscrubPaused());
    try {
      const mentionedUserId = keys[count];

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
      console.error("Failed to fetch User", e);
    }
  }
  return messages.map((msg) =>
    Object.assign(msg, {
      content: Object.keys(userMap).reduce((acc, curr) => {
        const keyValue = userMap[curr];
        return acc
          .replaceAll(`<@${curr}`, `@${keyValue}`)
          .replaceAll(`<@!${curr}`, `@${keyValue}`);
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
        await checkDiscrubPaused();
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
      console.error("Error fetching channel messages", e);
    } finally {
      return { retArr: retArr.map((m) => new Message(m)), retThreads };
    }
  };

const _messageTypeAllowed = (type) => {
  return [0, 6, 7, 8, 9, 10, 11, 12, 18, 19, 20, 22, 23, 24].some(
    (t) => t === type
  );
};

const _getMessages =
  (channelId, isThread = false, initialArr = []) =>
  async (dispatch, getState) => {
    const { token } = getState().user;
    const { selectedDm } = getState().dm;
    const isDM = !!selectedDm.id;
    const trackedThreads = []; // The thread ids that we found while parsing messages
    try {
      let lastId = "";
      let reachedEnd = false;
      let threadedData = [];
      while (!reachedEnd) {
        if (dispatch(getDiscrubCancelled())) break;
        await dispatch(checkDiscrubPaused());
        const data = await fetchMessageData(token, lastId, channelId);
        if (data.message && data.message.includes("Missing Access")) break;
        if (data.length < 100) reachedEnd = true;
        if (data.length > 0) lastId = data[data.length - 1].id;
        if (data && (data[0]?.content || data[0]?.attachments)) {
          for (const m of data) {
            if (_messageTypeAllowed(m.type)) {
              if (m.thread && m.thread.id) {
                trackedThreads.push({
                  id: m.thread.id,
                  name: m.thread.name,
                  archived: m.thread.thread_metadata?.archived,
                }); // Found a thread
                const foundMessages = await dispatch(
                  _getMessages(m.thread.id, true, initialArr)
                );
                threadedData = threadedData.concat(
                  [m].concat(
                    foundMessages.sort((a, b) => a.position - b.position)
                  )
                );
              } else threadedData.push(m);
            }
          }

          if (!isThread) {
            initialArr = initialArr.concat(threadedData);
            threadedData = [];
          }

          dispatch(setFetchedMessageLength(initialArr.length));
        }
      }
      //Final check for any previously unfound threads
      let retThreads = [...trackedThreads];
      if (!isThread && !isDM) {
        let unfoundedThreads = await fetchThreads(token, channelId);
        unfoundedThreads = unfoundedThreads
          .filter((ft) => !trackedThreads.find((tt) => ft.id === tt.id))
          .map((x) => ({ id: x.id, name: x.name, archived: true }));
        retThreads = retThreads.concat(unfoundedThreads);
        for (const ut of unfoundedThreads) {
          const data = await dispatch(_getMessages(ut.id, true, initialArr));
          initialArr = initialArr.concat(data);
          dispatch(setFetchedMessageLength(initialArr.length));
        }
      }

      return isThread
        ? threadedData
        : { retArr: initialArr.map((m) => new Message(m)), retThreads };
    } catch (e) {
      console.error("Error fetching channel messages", e);
    }
  };

export default messageSlice.reducer;
