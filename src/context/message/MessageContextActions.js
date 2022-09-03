import {
  fetchMessageData,
  editMessage,
  deleteMessage as delMsg,
  fetchThreads,
  fetchUserMessageData,
} from "../../discordService";
import {
  GET_MESSAGE_DATA,
  GET_MESSAGE_DATA_COMPLETE,
  UPDATE_FETCHED_MESSAGES,
  RESET_MESSAGE_DATA_COMPLETE,
  FILTER_MESSAGE,
  FILTER_MESSAGE_COMPLETE,
  UPDATE_FILTERS_COMPLETE,
  UPDATE_MESSAGE_SUCCESS,
  SET_SELECTED,
  DELETE_MESSAGE_SUCCESS,
  SET_ATTACHMENT_MESSAGE_COMPLETE,
  RESET_FILTERS_COMPLETE,
} from "./MessageContextConstants";

export const setAttachmentMessage = async (message, dispatch) => {
  dispatch({ type: SET_ATTACHMENT_MESSAGE_COMPLETE, payload: message });
};

export const setSelected = async (messageIds, dispatch) => {
  dispatch({ type: SET_SELECTED, payload: messageIds });
};

export const deleteMessage = async (message, channelId, token, dispatch) => {
  try {
    const response = await delMsg(token, message.id, channelId);
    if (response.status === 204) {
      dispatch({ type: DELETE_MESSAGE_SUCCESS, payload: message });
      return null;
    } else if (response.retry_after) {
      return response.retry_after;
    } else {
      return -1;
    }
  } catch (e) {
    console.error("Error Deleting Message", e, message);
  }
};

export const updateMessage = async (message, channelId, token, dispatch) => {
  // Returns null on success, -1 on permission error, and an unsigned int on retry_after error
  try {
    const data = await editMessage(
      token,
      message.id,
      { content: message.content, attachments: message.attachments },
      channelId
    );
    if (!data.message) {
      dispatch({ type: UPDATE_MESSAGE_SUCCESS, payload: data });
      return null;
    } else if (data.retry_after) {
      return data.retry_after;
    } else {
      return -1;
    }
  } catch (e) {
    console.error("Error Editing Message");
  }
};

export const resetFilters = (dispatch) => {
  dispatch({ type: RESET_FILTERS_COMPLETE });
};

export const updateFilters = async (
  filterName,
  filterValue,
  filterType,
  activeFilters,
  dispatch
) => {
  let filteredList = activeFilters.filter((x) => x.filterName !== filterName);
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
      retFilters = [...filteredList.filter((f) => f.filterType !== filterType)];
  }

  dispatch({ type: UPDATE_FILTERS_COMPLETE, payload: retFilters });
};

export const filterMessages = async (filters, messages, dispatch) => {
  dispatch({ type: FILTER_MESSAGE });
  let retArr = [];
  messages.forEach((x) => {
    let criteriaMet = true;
    filters.forEach((param) => {
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
        } else {
          let rowValue = x[param.filterName].toLowerCase();
          let filterValue = param.filterValue.toLowerCase();
          if (!rowValue.includes(filterValue)) {
            criteriaMet = false;
          }
        }
        return criteriaMet;
      } else if (param.filterType === "date") {
        if (param.filterName === "startTime") {
          let startTime = Date.parse(param.filterValue);
          let rowTime = Date.parse(x.timestamp);
          if (rowTime < startTime) {
            criteriaMet = false;
          }
        } else if (param.filterName === "endTime") {
          let endTime = Date.parse(param.filterValue);
          let rowTime = Date.parse(x.timestamp);
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
  dispatch({ type: FILTER_MESSAGE_COMPLETE, payload: retArr });
};

export const resetMessageData = async (dispatch) => {
  dispatch({ type: RESET_MESSAGE_DATA_COMPLETE });
};

export const getMessageData = async (
  channelIdRef,
  token,
  dispatch,
  isDM = false,
  preFilterUserId
) => {
  const parseAts = (messageContent, uniqueRecipients) => {
    for (let [key, value] of uniqueRecipients.entries()) {
      messageContent = messageContent.replace(`<@${key}>`, `@${value}`);
      messageContent = messageContent.replace(`<@!${key}>`, `@${value}`);
    }
    return messageContent;
  };

  dispatch({ type: GET_MESSAGE_DATA });

  let retArr = [],
    retThreads = [];
  if (preFilterUserId) {
    ({ retArr, retThreads } = await _getUserMessages(
      channelIdRef,
      token,
      preFilterUserId,
      dispatch
    ));
  } else {
    let tempArr = [];
    ({ retArr, retThreads } = await _getMessages(
      channelIdRef,
      token,
      dispatch,
      tempArr,
      false,
      isDM
    ));
  }
  let uniqueRecipients = new Map();
  await retArr.forEach((x) => {
    uniqueRecipients.set(x.author.id, x.author.username);
  });
  dispatch({
    type: GET_MESSAGE_DATA_COMPLETE,
    payload: {
      threads: retThreads,
      messages: retArr.map((message) => {
        return {
          ...message,
          username: message.author.username,
          content: parseAts(message.content, uniqueRecipients),
        };
      }),
    },
  });
};

const _getMessages = async (
  channelIdRef,
  token,
  dispatch,
  retArr,
  thread = false,
  isDM = false
) => {
  const originalChannelId = channelIdRef?.current?.slice();
  const trackedThreads = []; // The thread ids that we found while parsing messages
  try {
    let lastId = "";
    let reachedEnd = false;
    let threadedData = [];
    while (!reachedEnd) {
      if (channelIdRef.current !== originalChannelId) break;
      const data = await fetchMessageData(token, lastId, originalChannelId);
      if (data.message && data.message.includes("Missing Access")) break;
      if (data.length < 100) reachedEnd = true;
      if (data.length > 0) lastId = data[data.length - 1].id;
      if (data && (data[0]?.content || data[0]?.attachments)) {
        for (const m of data) {
          if (m.type !== 21) {
            if (m.thread) {
              channelIdRef.current = m.thread?.id?.slice();
              trackedThreads.push({
                id: m.thread?.id?.slice(),
                name: m.thread?.name.slice(),
                archived: m.thread?.thread_metadata?.archived,
              }); // Found a thread
              const foundMessages = await _getMessages(
                channelIdRef,
                token,
                dispatch,
                retArr,
                true
              );
              threadedData = threadedData.concat(
                [m].concat(
                  foundMessages.sort((a, b) => a.position - b.position)
                )
              );
              channelIdRef.current = originalChannelId?.slice();
            } else threadedData.push(m);
          }
        }

        if (!thread) {
          retArr = retArr.concat(threadedData);
          threadedData = [];
        }

        dispatch({
          type: UPDATE_FETCHED_MESSAGES,
          payload: {
            fetchedMessageLength: retArr.length,
          },
        });
      }
    }
    //Final check for unfounded threads
    let retThreads = [...trackedThreads];
    if (!thread && !isDM) {
      let unfoundedThreads = await fetchThreads(token, originalChannelId);
      unfoundedThreads = unfoundedThreads
        .filter((ft) => !trackedThreads.find((tt) => ft.id === tt.id))
        .map((x) => ({ id: x.id, name: x.name, archived: true }));
      retThreads = retThreads.concat(unfoundedThreads);
      for (const ut of unfoundedThreads) {
        channelIdRef.current = ut?.id?.slice();
        const data = await _getMessages(
          channelIdRef,
          token,
          dispatch,
          retArr,
          true
        );
        retArr = retArr.concat(data);
        channelIdRef.current = originalChannelId?.slice();
        dispatch({
          type: UPDATE_FETCHED_MESSAGES,
          payload: {
            fetchedMessageLength: retArr.length,
          },
        });
      }
    }

    return thread ? threadedData : { retArr, retThreads };
  } catch (e) {
    console.error("Error fetching channel messages", e);
  }
};

const _getUserMessages = async (
  channelIdRef,
  token,
  preFilterUserId,
  dispatch
) => {
  const originalChannelId = channelIdRef?.current?.slice();
  let retArr = [];
  let retThreads = [];
  try {
    let offset = 0;
    let reachedEnd = false;
    while (!reachedEnd) {
      if (channelIdRef.current !== originalChannelId) break;
      const data = await fetchUserMessageData(
        token,
        offset,
        originalChannelId,
        preFilterUserId
      );

      if (data.retry_after) {
        await new Promise((resolve) => setTimeout(resolve, data.retry_after));
        continue;
      }
      if (!data || data?.messages?.length === 0) break;
      if (data.threads)
        for (const th of data.threads)
          if (!retThreads.find((eTh) => eTh.id === th.id)) retThreads.push(th);
      const foundMessages = data.messages.flat();
      if (foundMessages.length < 25) reachedEnd = true;
      offset += 25;
      for (const m of foundMessages) if (m.type !== 21) retArr.push(m);
      dispatch({
        type: UPDATE_FETCHED_MESSAGES,
        payload: {
          fetchedMessageLength: retArr.length,
        },
      });
    }
    return { retArr, retThreads };
  } catch (e) {
    console.error("Error fetching channel messages", e);
  }
};
