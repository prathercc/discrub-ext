import React, {
  createContext,
  useReducer,
  useContext,
  useRef,
  useEffect,
} from "react";
import { MessageReducer } from "./MessageReducer";
import { UserContext } from "../user/UserContext";
import { ChannelContext } from "../channel/ChannelContext";
import { DmContext } from "../dm/DmContext";
import {
  DELETE_MESSAGE_SUCCESS,
  FILTER_MESSAGE,
  FILTER_MESSAGE_COMPLETE,
  GET_MESSAGE_DATA,
  GET_MESSAGE_DATA_COMPLETE,
  RESET_FILTERS_COMPLETE,
  RESET_MESSAGE_DATA_COMPLETE,
  SET_ATTACHMENT_MESSAGE_COMPLETE,
  SET_SELECTED,
  UPDATE_FETCHED_MESSAGES,
  UPDATE_FILTERS_COMPLETE,
  UPDATE_MESSAGE_SUCCESS,
  SET_EMBED_MESSAGE_COMPLETE,
  SET_ORDER,
  SET_SEARCH_BEFORE_DATE_COMPLETE,
  SET_SEARCH_AFTER_DATE_COMPLETE,
  SET_SEARCH_MESSAGE_CONTENT_COMPLETE,
  SET_SELECTED_HAS_TYPES_COMPLETE,
} from "./MessageContextConstants";
import {
  editMessage,
  deleteMessage as delMsg,
  fetchSearchMessageData,
  fetchThreads,
  fetchMessageData,
  getUser,
} from "../../services/discordService";
import { GuildContext } from "../guild/GuildContext";
import parseISO from "date-fns/parseISO";
import { wait } from "../../utils";
import Message from "../../classes/Message";

export const MessageContext = createContext();

const MessageContextProvider = (props) => {
  const { state: userState } = useContext(UserContext);
  const { state: channelState } = useContext(ChannelContext);
  const { state: dmState } = useContext(DmContext);
  const { state: guildState } = useContext(GuildContext);

  const selectedChannelIdRef = useRef();
  const selectedDmIdRef = useRef();
  const channelPreFilterUserIdRef = useRef();
  const dmPreFilterUserIdRef = useRef();
  const selectedGuildIdRef = useRef();

  const { token } = userState;
  const { selectedChannel, preFilterUserId: channelPreFilterUserId } =
    channelState;
  const { selectedDm, preFilterUserId: dmPreFilterUserId } = dmState;
  const { selectedGuild } = guildState;

  selectedChannelIdRef.current = selectedChannel.id; // Needed incase channelId changes and we can cancel the fetching.
  selectedDmIdRef.current = selectedDm.id;
  channelPreFilterUserIdRef.current = channelPreFilterUserId;
  dmPreFilterUserIdRef.current = dmPreFilterUserId;
  selectedGuildIdRef.current = selectedGuild.id;

  const [state, dispatch] = useReducer(
    MessageReducer,
    Object.freeze({
      messages: [], // Message objects
      selectedMessages: [], // Array of id
      filteredMessages: [], // Message objects
      filters: [], // Array of object filters
      fetchedMessageLength: 0, // Current length of fetched messages, used for debugging message fetch progress
      isLoading: null,
      attachmentMessage: null, // The selected message for deleting attachments.
      embedMessage: null, // The selected message for viewing embeds.
      threads: [], // The list of threads for a given messages arr
      order: "asc",
      orderBy: "",
      searchBeforeDate: null,
      searchAfterDate: null,
      totalSearchMessages: 0,
      searchMessageContent: null,
      hasTypes: ["embed", "file", "image", "link", "sound", "sticker", "video"],
      selectedHasTypes: [],
    })
  );

  useEffect(() => {
    const filterMessages = async () => {
      await _filterMessages(state.filters, state.messages, dispatch);
    };
    if (state.filters.length) filterMessages();
  }, [state.filters, state.messages]);

  const setSelectedHasTypes = async (val) => {
    return dispatch({
      type: SET_SELECTED_HAS_TYPES_COMPLETE,
      payload: val,
    });
  };

  const setSearchMessageContent = async (val) => {
    return dispatch({
      type: SET_SEARCH_MESSAGE_CONTENT_COMPLETE,
      payload: val,
    });
  };

  const setSearchBeforeDate = async (val) => {
    return dispatch({
      type: SET_SEARCH_BEFORE_DATE_COMPLETE,
      payload: val,
    });
  };

  const setSearchAfterDate = async (val) => {
    return dispatch({
      type: SET_SEARCH_AFTER_DATE_COMPLETE,
      payload: val,
    });
  };

  const setEmbedMessage = async (message) => {
    return dispatch({
      type: SET_EMBED_MESSAGE_COMPLETE,
      payload: message,
    });
  };

  const setAttachmentMessage = async (message) => {
    return dispatch({
      type: SET_ATTACHMENT_MESSAGE_COMPLETE,
      payload: message,
    });
  };

  const setSelected = async (messageIds) => {
    return dispatch({ type: SET_SELECTED, payload: messageIds });
  };

  const setOrder = async (order, orderBy) => {
    return dispatch({
      type: SET_ORDER,
      payload: { order: order, orderBy: orderBy },
    });
  };

  const updateMessage = async (message) => {
    // Returns null on success, -1 on permission error, and an unsigned int on retry_after error
    try {
      const data = await editMessage(
        token,
        message.id,
        { content: message.content, attachments: message.attachments },
        message.channel_id
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

  const deleteMessage = async (message) => {
    try {
      const response = await delMsg(token, message.id, message.channel_id);
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

  const getMessageData = async () => {
    if (token) {
      const convoIdRef = selectedChannelIdRef.current
        ? selectedChannelIdRef
        : selectedDm.id
        ? selectedDmIdRef
        : null;
      const originalChannelId = convoIdRef?.current?.slice();
      const isDM =
        !!convoIdRef && convoIdRef.current === selectedDmIdRef.current;

      const preFilterUserId =
        channelPreFilterUserIdRef.current || dmPreFilterUserIdRef.current;

      dispatch({ type: GET_MESSAGE_DATA });

      let retArr = [],
        retThreads = [];
      const criteriaExists = [
        preFilterUserId,
        state.searchBeforeDate,
        state.searchAfterDate,
        state.searchMessageContent,
        state.selectedHasTypes.length,
      ].some((c) => c);

      if (criteriaExists) {
        ({ retArr, retThreads } = await _getSearchMessages(
          convoIdRef,
          selectedGuildIdRef,
          token,
          {
            preFilterUserId,
            searchBeforeDate: state.searchBeforeDate,
            searchAfterDate: state.searchAfterDate,
            searchMessageContent: state.searchMessageContent,
            selectedHasTypes: state.selectedHasTypes,
          },
          dispatch
        ));
      } else {
        let tempArr = [];
        ({ retArr, retThreads } = await _getMessages(
          convoIdRef,
          token,
          dispatch,
          tempArr,
          false,
          isDM
        ));
      }

      const messagesWithMentions = await _parseMentions(token, retArr);

      const payload = {
        threads: retThreads,
        messages: messagesWithMentions,
      };

      dispatch({
        type: GET_MESSAGE_DATA_COMPLETE,
        payload: originalChannelId !== convoIdRef?.current ? {} : payload,
      });

      return payload;
    }
  };

  const resetMessageData = async () => {
    return dispatch({ type: RESET_MESSAGE_DATA_COMPLETE });
  };

  const updateFilters = async (filterName, filterValue, filterType) => {
    let filteredList = state.filters.filter((x) => x.filterName !== filterName);
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

    return dispatch({ type: UPDATE_FILTERS_COMPLETE, payload: retFilters });
  };

  const resetFilters = () => {
    return dispatch({ type: RESET_FILTERS_COMPLETE });
  };

  return (
    <MessageContext.Provider
      value={{
        state,
        dispatch,
        getMessageData,
        resetMessageData,
        updateFilters,
        updateMessage,
        setSelected,
        deleteMessage,
        setAttachmentMessage,
        resetFilters,
        setEmbedMessage,
        setOrder,
        setSearchBeforeDate,
        setSearchAfterDate,
        setSearchMessageContent,
        setSelectedHasTypes,
      }}
    >
      {props.children}
    </MessageContext.Provider>
  );
};

const _parseMentions = async (token, messages) => {
  const userMap = {};
  const regex = /<@[0-9]+>|<@![0-9]+>/g;

  messages.forEach((msg) => {
    msg.content
      .match(regex)
      ?.map((mention) =>
        mention.replace("<@", "").replace("<@!", "").replace(">", "")
      )
      ?.forEach((mention) => (userMap[mention] = null));
  });

  let count = 0;
  const keys = Object.keys(userMap);
  while (count < keys.length) {
    try {
      const mentionedUserId = keys[count];
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
      content: _getMentionContent(msg.content, userMap),
      username: msg.author.username,
    })
  );
};

const _getMentionContent = (messageContent, userMap) => {
  let retContent = messageContent;
  Object.keys(userMap).forEach((key) => {
    const keyValue = userMap[key];
    retContent = retContent.replaceAll(`<@${key}>`, `@${keyValue}`);
    retContent = retContent.replaceAll(`<@!${key}>`, `@${keyValue}`);
  });
  return retContent;
};

const _filterMessages = async (filters, messages, dispatch) => {
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
          if (!messageContent.includes(filterValue) && !embedsContainFilter()) {
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
  dispatch({ type: FILTER_MESSAGE_COMPLETE, payload: retArr });
};

const _messageTypeAllowed = (type) => {
  return [0, 6, 7, 8, 9, 10, 11, 12, 18, 19, 20, 22, 23, 24].some(
    (t) => t === type
  );
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
          if (_messageTypeAllowed(m.type)) {
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

    return thread
      ? threadedData
      : { retArr: retArr.map((m) => new Message(m)), retThreads };
  } catch (e) {
    console.error("Error fetching channel messages", e);
  }
};

const _getSearchMessages = async (
  channelIdRef,
  guildIdRef,
  token,
  searchCriteria,
  dispatch
) => {
  const originalChannelId = channelIdRef?.current?.slice() || null;
  const originalGuildId = guildIdRef?.current?.slice() || null;
  let retArr = [];
  let retThreads = [];
  try {
    let offset = 0;
    let reachedEnd = false;
    let criteria = { ...searchCriteria };
    let totalMessages = null;
    while (!reachedEnd) {
      const channelChanged =
        (channelIdRef?.current || null) !== originalChannelId;
      const guildChanged = (guildIdRef.current || null) !== originalGuildId;
      if (channelChanged || guildChanged) break;

      const data = await fetchSearchMessageData(
        token,
        offset,
        originalChannelId,
        originalGuildId,
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
          if (!retThreads.find((eTh) => eTh.id === th.id)) retThreads.push(th);
      const foundMessages = messages.flat();

      // Max offset is 5000, need to reset offset and update/set searchBeforeDate
      if (offset === 5000) {
        const { timestamp } = foundMessages[foundMessages.length - 1];
        criteria = { ...criteria, searchBeforeDate: parseISO(timestamp) };
        offset = 0;
      } else if (offset >= total_results) reachedEnd = true;
      else offset += 25;

      for (const m of foundMessages)
        if (_messageTypeAllowed(m.type)) retArr.push(m);
      dispatch({
        type: UPDATE_FETCHED_MESSAGES,
        payload: {
          fetchedMessageLength: retArr.length,
          totalSearchMessages: totalMessages,
        },
      });
    }
  } catch (e) {
    console.error("Error fetching channel messages", e);
  } finally {
    return { retArr: retArr.map((m) => new Message(m)), retThreads };
  }
};

export default MessageContextProvider;
