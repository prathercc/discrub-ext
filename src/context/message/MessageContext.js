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
import Typography from "@mui/material/Typography";
// import { GuildContext } from "../guild/GuildContext";
import ExportButtonGroupStyles from "../../components/Export/ExportButtonGroup.styles";
import { Stack } from "@mui/material";
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
} from "./MessageContextConstants";
import {
  editMessage,
  deleteMessage as delMsg,
  fetchUserMessageData,
  fetchThreads,
  fetchMessageData,
} from "../../discordService";

export const MessageContext = createContext();

const MessageContextProvider = (props) => {
  const classes = ExportButtonGroupStyles();

  const { state: userState } = useContext(UserContext);
  const { state: channelState } = useContext(ChannelContext);
  // const { state: guildState } = useContext(GuildContext);
  const { state: dmState } = useContext(DmContext);

  const selectedChannelIdRef = useRef();
  const selectedDmIdRef = useRef();
  const channelPreFilterUserIdRef = useRef();
  const dmPreFilterUserIdRef = useRef();

  const { token } = userState;
  const { selectedChannel, preFilterUserId: channelPreFilterUserId } =
    channelState;
  const { selectedDm, preFilterUserId: dmPreFilterUserId } = dmState;

  selectedChannelIdRef.current = selectedChannel.id; // Needed incase channelId changes and we can cancel the fetching.
  selectedDmIdRef.current = selectedDm.id;
  channelPreFilterUserIdRef.current = channelPreFilterUserId;
  dmPreFilterUserIdRef.current = dmPreFilterUserId;

  const [state, dispatch] = useReducer(
    MessageReducer,
    Object.freeze({
      messages: [], // Message objects
      selectedMessages: [], // Array of id
      filteredMessages: [], // Message objects
      filters: [], // Array of object filters
      fetchedMessageLength: 0, // Current length of fetched messages, used for debugging message fetch progress
      isLoading: null,
      attachmentMessage: null, // The selected message for deleting attachments
      threads: [], // The list of threads for a given messages arr
    })
  );

  useEffect(() => {
    const filterMessages = async () => {
      await _filterMessages(state.filters, state.messages, dispatch);
    };
    if (state.filters.length) filterMessages();
  }, [state.filters, state.messages]);

  const getExportTitle = () => {
    const directMessage = dmState.dms.find(
      (directMessage) => directMessage.id === selectedDm.id
    );

    return (
      <>
        {directMessage ? (
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
            ml="10px"
          >
            <Typography className={classes.typographyHash} variant="h4">
              @
            </Typography>
            <Typography className={classes.typographyTitle} variant="h6">
              {directMessage.recipients.length === 1
                ? directMessage.recipients[0].username
                : directMessage.name
                ? `Group Chat - ${directMessage.name}`
                : `Unnamed Group Chat - ${directMessage.id}`}
            </Typography>
          </Stack>
        ) : (
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={1}
            ml="10px"
          >
            <Typography className={classes.typographyHash} variant="h4">
              #
            </Typography>
            <Typography className={classes.typographyTitle} variant="h6">
              {
                channelState.channels.find(
                  (channel) => channel.id === selectedChannel.id
                )?.name
              }
            </Typography>
          </Stack>
        )}
      </>
    );
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
      const isDM =
        !!convoIdRef && convoIdRef.current === selectedDmIdRef.current;

      const preFilterUserId =
        channelPreFilterUserIdRef.current || dmPreFilterUserIdRef.current;

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
          convoIdRef,
          token,
          preFilterUserId,
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
      let uniqueRecipients = new Map();
      await retArr.forEach((x) => {
        uniqueRecipients.set(x.author.id, x.author.username);
      });

      const payload = {
        threads: retThreads,
        messages: retArr.map((message) => {
          return {
            ...message,
            username: message.author.username,
            content: parseAts(message.content, uniqueRecipients),
          };
        }),
      };

      dispatch({
        type: GET_MESSAGE_DATA_COMPLETE,
        payload,
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
        getExportTitle,
        resetFilters,
      }}
    >
      {props.children}
    </MessageContext.Provider>
  );
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
        await new Promise((resolve) =>
          setTimeout(resolve, data.retry_after * 1000)
        );
        continue;
      }
      if (!data || data?.messages?.length === 0) break;
      if (data.threads)
        for (const th of data.threads)
          if (!retThreads.find((eTh) => eTh.id === th.id)) retThreads.push(th);
      const foundMessages = data.messages.flat();
      if (foundMessages.length < 25) reachedEnd = true;
      offset += 25;
      for (const m of foundMessages)
        if (_messageTypeAllowed(m.type)) retArr.push(m);
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
    return { retArr, retThreads };
  }
};

export default MessageContextProvider;
