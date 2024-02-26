import { RootState } from "../../app/store";
import {
  setExportUserMap as setExportUserMapAction,
  setExportEmojiMap as setExportEmojiMapAction,
  setExportAvatarMap as setExportAvatarMapAction,
  setExportMediaMap as setExportMediaMapAction,
  setExportRoleMap as setExportRoleMapAction,
  setExportReactionMap as setExportReactionMapAction,
  resetExportMaps as resetExportMapsAction,
  setSortOverride as setSortOverrideAction,
  setMessagesPerPage as setMessagesPerPageAction,
  setCurrentPage as setCurrentPageAction,
  setIsGenerating as setIsGeneratingAction,
  setIsExporting as setIsExportingAction,
  setPreviewImages as setPreviewImagesAction,
  setDownloadImages as setDownloadImagesAction,
  setArtistMode as setArtistModeAction,
  setName as setNameAction,
  resetExportSettings as resetExportSettingsAction,
  getSpecialFormatting as getSpecialFormattingAction,
  getFormattedInnerHtml as getFormattedInnerHtmlAction,
  exportMessages as exportMessagesAction,
  exportChannels as exportChannelsAction,
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
import { SortDirection } from "../../enum/sort-direction";
import Channel from "../../classes/channel";
import ExportUtils from "./export-utils";
import { ExportType } from "../../enum/export-type";
import Message from "../../classes/message";

const useExportSlice = () => {
  const dispatch = useAppDispatch();

  const useIsExporting = (): boolean =>
    useAppSelector((state: RootState) => state.export.isExporting);

  const useDownloadImages = (): boolean =>
    useAppSelector((state: RootState) => state.export.downloadImages);

  const usePreviewImages = (): boolean =>
    useAppSelector((state: RootState) => state.export.previewImages);

  const useArtistMode = (): boolean =>
    useAppSelector((state: RootState) => state.export.artistMode);

  const useName = (): string =>
    useAppSelector((state: RootState) => state.export.name);

  const useIsGenerating = (): boolean =>
    useAppSelector((state: RootState) => state.export.isGenerating);

  const useCurrentPage = (): number =>
    useAppSelector((state: RootState) => state.export.currentPage);

  const useMessagesPerPage = (): number =>
    useAppSelector((state: RootState) => state.export.messagesPerPage);

  const useSortOverride = (): SortDirection =>
    useAppSelector((state: RootState) => state.export.sortOverride);

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

  const state = {
    isExporting: useIsExporting,
    downloadImages: useDownloadImages,
    previewImages: usePreviewImages,
    artistMode: useArtistMode,
    name: useName,
    isGenerating: useIsGenerating,
    currentPage: useCurrentPage,
    messagesPerPage: useMessagesPerPage,
    sortOverride: useSortOverride,
    userMap: useUserMap,
    emojiMap: useEmojiMap,
    avatarMap: useAvatarMap,
    mediaMap: useMediaMap,
    roleMap: useRoleMap,
    reactionMap: useReactionMap,
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

  const setSortOverride = (type: SortDirection): void => {
    dispatch(setSortOverrideAction(type));
  };

  const setMessagesPerPage = (amount: number): void => {
    dispatch(setMessagesPerPageAction(amount));
  };

  const setCurrentPage = (page: number): void => {
    dispatch(setCurrentPageAction(page));
  };

  const setIsGenerating = (value: boolean): void => {
    dispatch(setIsGeneratingAction(value));
  };

  const setIsExporting = (value: boolean): void => {
    dispatch(setIsExportingAction(value));
  };

  const setPreviewImages = (value: boolean): void => {
    dispatch(setPreviewImagesAction(value));
  };

  const setDownloadImages = (value: boolean): void => {
    dispatch(setDownloadImagesAction(value));
  };

  const setArtistMode = (value: boolean): void => {
    dispatch(setArtistModeAction(value));
  };

  const setName = (value: string): void => {
    dispatch(setNameAction(value));
  };

  const resetExportSettings = (): void => {
    dispatch(resetExportSettingsAction());
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
      getFormattedInnerHtmlAction({ content, exportView, isReply })
    );
  };

  const exportMessages = (
    messages: Message[],
    entityName: string,
    exportUtils: ExportUtils,
    format: ExportType
  ): void => {
    dispatch(exportMessagesAction(messages, entityName, exportUtils, format));
  };

  const exportChannels = (
    channels: Channel[],
    exportUtils: ExportUtils,
    format: ExportType,
    userId?: Snowflake
  ) => {
    dispatch(exportChannelsAction(channels, exportUtils, format, userId));
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
    setSortOverride,
    setMessagesPerPage,
    setCurrentPage,
    setIsGenerating,
    setIsExporting,
    setPreviewImages,
    setDownloadImages,
    setArtistMode,
    setName,
    resetExportSettings,
    getSpecialFormatting,
    getFormattedInnerHtml,
    exportMessages,
    exportChannels,
  };
};

export { useExportSlice };
