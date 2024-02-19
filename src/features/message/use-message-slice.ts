import { RootState } from "../../app/store";
import {
  setIsLoading as setIsLoadingAction,
  setSelectedHasTypes as setSelectedHasTypesAction,
  setSearchMessageContent as setSearchMessageContentAction,
  setSearchBeforeDate as setSearchBeforeDateAction,
  setSearchAfterDate as setSearchAfterDateAction,
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
import { DeleteConfiguration, Filter } from "./message-types";
import { HasType } from "../../enum/has-type";
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

  const useSearchBeforeDate = (): Date | Maybe =>
    useAppSelector((state: RootState) => state.message.searchBeforeDate);

  const useSearchAfterDate = (): Date | Maybe =>
    useAppSelector((state: RootState) => state.message.searchAfterDate);

  const useSearchMessageContent = (): string | Maybe =>
    useAppSelector((state: RootState) => state.message.searchMessageContent);

  const useSelectedHasTypes = (): HasType[] =>
    useAppSelector((state: RootState) => state.message.selectedHasTypes);

  const state = {
    messages: useMessages,
    selectedMessages: useSelectedMessages,
    filteredMessages: useFilteredMessages,
    filters: useFilters,
    isLoading: useIsLoading,
    order: useOrder,
    orderBy: useOrderBy,
    searchBeforeDate: useSearchBeforeDate,
    searchAfterDate: useSearchAfterDate,
    searchMessageContent: useSearchMessageContent,
    selectedHasTypes: useSelectedHasTypes,
  };

  const setIsLoading = (value: boolean): void => {
    dispatch(setIsLoadingAction(value));
  };

  const setSelectedHasTypes = (hasTypes: HasType[]) => {
    dispatch(setSelectedHasTypesAction(hasTypes));
  };

  const setSearchMessageContent = (content: string | Maybe) => {
    dispatch(setSearchMessageContentAction(content));
  };

  const setSearchBeforeDate = (date: Date | Maybe) => {
    dispatch(setSearchBeforeDateAction(date));
  };

  const setSearchAfterDate = (date: Date | Maybe) => {
    dispatch(setSearchAfterDateAction(date));
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
    emoji: string
  ) => {
    dispatch(deleteReactionAction(channelId, messageId, emoji));
  };

  const deleteMessages = (
    messages: Message[],
    deleteConfig?: DeleteConfiguration
  ) => {
    dispatch(deleteMessagesAction(messages, deleteConfig));
  };

  const getMessageData = (
    guildId: string | Maybe,
    channelId: string | Maybe,
    preFilterUserId?: string | Maybe
  ) => {
    return dispatch(getMessageDataAction(guildId, channelId, preFilterUserId));
  };

  const resetMessageData = () => {
    dispatch(resetMessageDataAction());
  };

  return {
    state,
    setIsLoading,
    setSelectedHasTypes,
    setSearchMessageContent,
    setSearchBeforeDate,
    setSearchAfterDate,
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
