import React, {
  createContext,
  useCallback,
  useReducer,
  useContext,
  useRef,
  useEffect,
} from "react";
import {
  getMessageData as getMessageDataAction,
  resetMessageData as resetMessageDataAction,
  filterMessages as filterMessagesAction,
  updateFilters as updateFiltersAction,
  updateMessage as updateMessageAction,
  setSelected as setSelectedAction,
  deleteMessage as deleteMessageAction,
  setAttachmentMessage as setAttachmentMessageAction,
  resetFilters as resetFiltersAction,
} from "./MessageContextActions";
import { MessageReducer } from "./MessageReducer";
import { UserContext } from "../user/UserContext";
import { ChannelContext } from "../channel/ChannelContext";
import { DmContext } from "../dm/DmContext";
import Typography from "@mui/material/Typography";
import { GuildContext } from "../guild/GuildContext";
import ExportButtonGroupStyles from "../../components/Export/ExportButtonGroup.styles";

export const MessageContext = createContext();

const MessageContextProvider = (props) => {
  const classes = ExportButtonGroupStyles();

  const { state: userState } = useContext(UserContext);
  const { state: channelState } = useContext(ChannelContext);
  const { state: guildState } = useContext(GuildContext);
  const { state: dmState } = useContext(DmContext);

  const selectedChannelIdRef = useRef();
  const selectedDmIdRef = useRef();
  const channelPreFilterUserIdRef = useRef();

  const { token } = userState;
  const { selectedChannel, preFilterUserId: channelPreFilterUserId } =
    channelState;
  const { selectedDm, preFilterUserId: dmPreFilterUserId } = dmState;

  selectedChannelIdRef.current = selectedChannel.id; // Needed incase channelId changes and we can cancel the fetching.
  selectedDmIdRef.current = selectedDm.id;
  channelPreFilterUserIdRef.current = channelPreFilterUserId;

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

  const getExportTitle = () => {
    const directMessage = dmState.dms.find(
      (directMessage) => directMessage.id === selectedDm.id
    );

    return (
      <>
        {directMessage ? (
          <Typography className={classes.typographyTitle} variant="h4">
            {directMessage.recipients.length === 1
              ? directMessage.recipients[0].username
              : directMessage.name
              ? `Group Chat - ${directMessage.name}`
              : `Unnamed Group Chat - ${directMessage.id}`}
          </Typography>
        ) : (
          <>
            <Typography className={classes.typographyTitle} variant="h4">
              {
                guildState.guilds.find(
                  (guild) => guild.id === guildState.selectedGuild.id
                )?.name
              }
            </Typography>
            <Typography className={classes.typographyTitle} variant="h6">
              {
                channelState.channels.find(
                  (channel) => channel.id === selectedChannel.id
                )?.name
              }
            </Typography>
          </>
        )}
      </>
    );
  };

  const setAttachmentMessage = async (message) => {
    await setAttachmentMessageAction(message, dispatch);
  };

  const setSelected = async (messageIds) => {
    await setSelectedAction(messageIds, dispatch);
  };

  const updateMessage = async (message) => {
    const response = await updateMessageAction(
      message,
      message.channel_id,
      token,
      dispatch
    );
    return response;
  };

  const deleteMessage = async (message) => {
    const response = await deleteMessageAction(
      message,
      message.channel_id,
      token,
      dispatch
    );
    return response;
  };

  const getMessageData = useCallback(async () => {
    if (selectedChannelIdRef.current && token)
      await getMessageDataAction(
        selectedChannelIdRef,
        token,
        dispatch,
        false,
        channelPreFilterUserIdRef.current
      );
    else if (selectedDm.id && token)
      await getMessageDataAction(
        selectedDmIdRef,
        token,
        dispatch,
        true,
        dmPreFilterUserId
      );
  }, [token, selectedDm.id, dmPreFilterUserId]);

  const resetMessageData = useCallback(async () => {
    await resetMessageDataAction(dispatch);
  }, []);

  const updateFilters = async (filterName, filterValue, filterType) => {
    await updateFiltersAction(
      filterName,
      filterValue,
      filterType,
      state.filters,
      dispatch
    );
  };

  const resetFilters = () => {
    resetFiltersAction(dispatch);
  };

  useEffect(() => {
    const filterMessages = async () => {
      await filterMessagesAction(state.filters, state.messages, dispatch);
    };
    if (state.filters.length) filterMessages();
  }, [state.filters, state.messages]);

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

export default MessageContextProvider;
