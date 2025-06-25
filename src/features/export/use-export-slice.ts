import { RootState } from "../../app/store";
import {
  setExportUserMap as setExportUserMapAction,
  setExportEmojiMap as setExportEmojiMapAction,
  setExportAvatarMap as setExportAvatarMapAction,
  setExportMediaMap as setExportMediaMapAction,
  setExportRoleMap as setExportRoleMapAction,
  setExportReactionMap as setExportReactionMapAction,
  resetExportMaps as resetExportMapsAction,
  setCurrentPage as setCurrentPageAction,
  setIsGenerating as setIsGeneratingAction,
  setIsExporting as setIsExportingAction,
  setName as setNameAction,
  getSpecialFormatting as getSpecialFormattingAction,
  getFormattedInnerHtml as getFormattedInnerHtmlAction,
  exportMessages as exportMessagesAction,
  exportChannels as exportChannelsAction,
  setExportMessages as setExportMessagesAction,
  setTotalPages as setTotalPagesAction,
  setCurrentExportEntity as setCurrentExportEntityAction,
} from "./export-slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  ExportAvatarMap,
  ExportEmojiMap,
  ExportMediaMap,
  ExportReactionMap,
  ExportRoleMap,
  ExportUserMap,
  FormattedInnerHtmlProps,
  SpecialFormatting,
} from "./export-types";
import Channel from "../../classes/channel";
import ExportUtils from "./export-utils";
import { ExportType } from "../../enum/export-type";
import Message from "../../classes/message";
import Guild from "../../classes/guild";

const useExportSlice = () => {
  const dispatch = useAppDispatch();

  const useIsExporting = (): boolean =>
    useAppSelector((state: RootState) => state.export.isExporting);

  const useName = (): string =>
    useAppSelector((state: RootState) => state.export.name);

  const useIsGenerating = (): boolean =>
    useAppSelector((state: RootState) => state.export.isGenerating);

  const useCurrentPage = (): number =>
    useAppSelector((state: RootState) => state.export.currentPage);

  const useTotalPages = (): number =>
    useAppSelector((state: RootState) => state.export.totalPages);

  const useUserMap = (): ExportUserMap =>
    useAppSelector((state: RootState) => state.export.exportMaps.userMap);

  const useEmojiMap = (): ExportEmojiMap =>
    useAppSelector((state: RootState) => state.export.exportMaps.emojiMap);

  const useAvatarMap = (): ExportAvatarMap =>
    useAppSelector((state: RootState) => state.export.exportMaps.avatarMap);

  const useMediaMap = (): ExportMediaMap =>
    useAppSelector((state: RootState) => state.export.exportMaps.mediaMap);

  const useRoleMap = (): ExportRoleMap =>
    useAppSelector((state: RootState) => state.export.exportMaps.roleMap);

  const useReactionMap = (): ExportReactionMap =>
    useAppSelector((state: RootState) => state.export.exportMaps.reactionMap);

  const useExportMessages = (): Message[] =>
    useAppSelector((state: RootState) => state.export.exportMessages);

  const useCurrentExportEntity = (): Guild | Channel | Maybe =>
    useAppSelector((state: RootState) => state.export.currentExportEntity);

  const state = {
    isExporting: useIsExporting,
    name: useName,
    isGenerating: useIsGenerating,
    currentPage: useCurrentPage,
    totalPages: useTotalPages,
    userMap: useUserMap,
    emojiMap: useEmojiMap,
    avatarMap: useAvatarMap,
    mediaMap: useMediaMap,
    roleMap: useRoleMap,
    reactionMap: useReactionMap,
    exportMessages: useExportMessages,
    currentExportEntity: useCurrentExportEntity,
  };

  const setCurrentExportEntity = (entity: Guild | Channel | Maybe): void => {
    dispatch(setCurrentExportEntityAction(entity));
  };

  const setExportMessages = (messages: Message[]): void => {
    dispatch(setExportMessagesAction(messages));
  };

  const setExportUserMap = (map: ExportUserMap): void => {
    dispatch(setExportUserMapAction(map));
  };

  const setExportEmojiMap = (map: ExportEmojiMap): void => {
    dispatch(setExportEmojiMapAction(map));
  };

  const setExportAvatarMap = (map: ExportAvatarMap): void => {
    dispatch(setExportAvatarMapAction(map));
  };

  const setExportMediaMap = (map: ExportMediaMap): void => {
    dispatch(setExportMediaMapAction(map));
  };

  const setExportRoleMap = (map: ExportRoleMap): void => {
    dispatch(setExportRoleMapAction(map));
  };

  const setExportReactionMap = (map: ExportReactionMap): void => {
    dispatch(setExportReactionMapAction(map));
  };

  const resetExportMaps = (maps: string[]): void => {
    dispatch(resetExportMapsAction(maps));
  };

  const setCurrentPage = (page: number): void => {
    dispatch(setCurrentPageAction(page));
  };

  const setTotalPages = (pages: number): void => {
    dispatch(setTotalPagesAction(pages));
  };

  const setIsGenerating = (value: boolean): void => {
    dispatch(setIsGeneratingAction(value));
  };

  const setIsExporting = (value: boolean): void => {
    dispatch(setIsExportingAction(value));
  };

  const setName = (value: string): void => {
    dispatch(setNameAction(value));
  };

  const getSpecialFormatting = (content: string): SpecialFormatting => {
    return dispatch(getSpecialFormattingAction(content));
  };

  const getFormattedInnerHtml = ({
    content,
    exportView,
    isReply,
  }: FormattedInnerHtmlProps): string => {
    return dispatch(
      getFormattedInnerHtmlAction({ content, exportView, isReply }),
    );
  };

  const exportMessages = (
    messages: Message[],
    entityName: string,
    exportUtils: ExportUtils,
    format: ExportType,
  ): void => {
    dispatch(exportMessagesAction(messages, entityName, exportUtils, format));
  };

  const exportChannels = (
    channels: Channel[],
    exportUtils: ExportUtils,
    format: ExportType,
  ) => {
    dispatch(exportChannelsAction(channels, exportUtils, format));
  };

  return {
    state,
    setExportUserMap,
    setExportEmojiMap,
    setExportAvatarMap,
    setExportMediaMap,
    setExportRoleMap,
    setExportReactionMap,
    resetExportMaps,
    setCurrentPage,
    setIsGenerating,
    setIsExporting,
    setName,
    getSpecialFormatting,
    getFormattedInnerHtml,
    exportMessages,
    exportChannels,
    setExportMessages,
    setTotalPages,
    setCurrentExportEntity,
  };
};

export { useExportSlice };
