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
  setLookupUserId as setLookupUserIdAction,
  setFetchProgress as setFetchProgressAction,
  resetFetchProgress as resetFetchProgressAction,
  setTotalSearchMessages as setTotalSearchMessagesAction,
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
} from "./message-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { DeleteConfiguration, FetchProgress, Filter } from "./message-types";
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

  const useFetchProgress = (): FetchProgress =>
    useAppSelector((state: RootState) => state.message.fetchProgress);

  const useLookupUserId = (): Snowflake | Maybe =>
    useAppSelector((state: RootState) => state.message.lookupUserId);

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

  const useTotalSearchMessages = (): number =>
    useAppSelector((state: RootState) => state.message.totalSearchMessages);

  const useSearchMessageContent = (): string | Maybe =>
    useAppSelector((state: RootState) => state.message.searchMessageContent);

  const useSelectedHasTypes = (): HasType[] =>
    useAppSelector((state: RootState) => state.message.selectedHasTypes);

  const state = {
    messages: useMessages,
    selectedMessages: useSelectedMessages,
    filteredMessages: useFilteredMessages,
    filters: useFilters,
    fetchProgress: useFetchProgress,
    lookupUserId: useLookupUserId,
    isLoading: useIsLoading,
    order: useOrder,
    orderBy: useOrderBy,
    searchBeforeDate: useSearchBeforeDate,
    searchAfterDate: useSearchAfterDate,
    totalSearchMessages: useTotalSearchMessages,
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

  const setLookupUserId = (userId: Snowflake | Maybe) => {
    dispatch(setLookupUserIdAction(userId));
  };

  const setFetchProgress = (progress: Partial<FetchProgress>) => {
    dispatch(setFetchProgressAction(progress));
  };

  const resetFetchProgress = () => {
    dispatch(resetFetchProgressAction());
  };

  const setTotalSearchMessages = (value: number) => {
    dispatch(setTotalSearchMessagesAction(value));
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

  const deleteMessages = (
    messages: Message[],
    deleteConfig?: DeleteConfiguration
  ) => {
    dispatch(deleteMessagesAction(messages, deleteConfig));
  };

  const getMessageData = (
    guildId: string | Maybe,
    channelId: string,
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
    setLookupUserId,
    setFetchProgress,
    resetFetchProgress,
    setTotalSearchMessages,
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
  };
};

export { useMessageSlice };
