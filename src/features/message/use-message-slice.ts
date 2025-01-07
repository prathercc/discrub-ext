import { RootState } from "../../app/store";
import {
  setIsLoading as setIsLoadingAction,
  setSearchCriteria as setSearchCriteriaAction,
  setSelected as setSelectedAction,
  setOrder as setOrderAction,
  setMessages as setMessagesAction,
  setFilteredMessages as setFilteredMessagesAction,
  resetFilters as resetFiltersAction,
  resetAdvancedFilters as resetAdvancedFiltersAction,
  updateFilters as updateFiltersAction,
  filterMessages as filterMessagesAction,
  deleteAttachment as deleteAttachmentAction,
  updateMessage as updateMessageAction,
  editMessages as editMessagesAction,
  deleteMessage as deleteMessageAction,
  deleteMessages as deleteMessagesAction,
  getMessageData as getMessageDataAction,
  resetMessageData as resetMessageDataAction,
  deleteReaction as deleteReactionAction,
} from "./message-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  DeleteConfiguration,
  Filter,
  MessageSearchOptions,
  SearchCriteria,
} from "./message-types";
import { SortDirection } from "../../enum/sort-direction";
import Message from "../../classes/message";
import Attachment from "../../classes/attachment";

const useMessageSlice = () => {
  const dispatch = useAppDispatch();

  const useMessages = (): Message[] =>
    useAppSelector((state: RootState) => state.message.messages);

  const useSelectedMessages = (): Snowflake[] =>
    useAppSelector((state: RootState) => state.message.selectedMessages);

  const useFilteredMessages = (): Message[] =>
    useAppSelector((state: RootState) => state.message.filteredMessages);

  const useFilters = (): Filter[] =>
    useAppSelector((state: RootState) => state.message.filters);

  const useIsLoading = (): boolean | Maybe =>
    useAppSelector((state: RootState) => state.message.isLoading);

  const useOrder = (): SortDirection =>
    useAppSelector((state: RootState) => state.message.order);

  const useOrderBy = (): keyof Message | Maybe =>
    useAppSelector((state: RootState) => state.message.orderBy);

  const useSearchCriteria = (): SearchCriteria =>
    useAppSelector((state: RootState) => state.message.searchCriteria);

  const state = {
    messages: useMessages,
    selectedMessages: useSelectedMessages,
    filteredMessages: useFilteredMessages,
    filters: useFilters,
    isLoading: useIsLoading,
    order: useOrder,
    orderBy: useOrderBy,
    searchCriteria: useSearchCriteria,
  };

  const setSearchCriteria = (criteria: Partial<SearchCriteria>): void => {
    dispatch(setSearchCriteriaAction(criteria));
  };

  const setIsLoading = (value: boolean): void => {
    dispatch(setIsLoadingAction(value));
  };

  const setSelected = (messageIds: Snowflake[]) => {
    dispatch(setSelectedAction(messageIds));
  };

  const setOrder = (orderProps: {
    order: SortDirection;
    orderBy: keyof Message;
  }) => {
    dispatch(setOrderAction(orderProps));
  };

  const setMessages = (messages: Message[]) => {
    dispatch(setMessagesAction(messages));
  };

  const setFilteredMessages = (messages: Message[]) => {
    dispatch(setFilteredMessagesAction(messages));
  };

  const resetFilters = () => {
    dispatch(resetFiltersAction());
  };

  const resetAdvancedFilters = () => {
    dispatch(resetAdvancedFiltersAction());
  };

  const updateFilters = (filter: Filter) => {
    dispatch(updateFiltersAction(filter));
  };

  const filterMessages = () => {
    dispatch(filterMessagesAction());
  };

  const deleteAttachment = (attachment: Attachment) => {
    dispatch(deleteAttachmentAction(attachment));
  };

  const updateMessage = (message: Message) => {
    dispatch(updateMessageAction(message));
  };

  const editMessages = (messages: Message[], text: string) => {
    dispatch(editMessagesAction(messages, text));
  };

  const deleteMessage = (message: Message) => {
    dispatch(deleteMessageAction(message));
  };

  const deleteReaction = (
    channelId: Snowflake,
    messageId: Snowflake,
    emoji: string,
  ) => {
    dispatch(deleteReactionAction(channelId, messageId, emoji));
  };

  const deleteMessages = (
    messages: Message[],
    deleteConfig?: DeleteConfiguration,
  ) => {
    dispatch(deleteMessagesAction(messages, deleteConfig));
  };

  const getMessageData = (
    guildId: string | Maybe,
    channelId: string | Maybe,
    options: Partial<MessageSearchOptions> = {},
  ) => {
    return dispatch(getMessageDataAction(guildId, channelId, options));
  };

  const resetMessageData = () => {
    dispatch(resetMessageDataAction());
  };

  return {
    state,
    setIsLoading,
    setSearchCriteria,
    setSelected,
    setOrder,
    setMessages,
    setFilteredMessages,
    resetFilters,
    resetAdvancedFilters,
    updateFilters,
    filterMessages,
    deleteAttachment,
    updateMessage,
    editMessages,
    deleteMessage,
    deleteMessages,
    getMessageData,
    resetMessageData,
    deleteReaction,
  };
};

export { useMessageSlice };
