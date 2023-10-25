import { createSlice } from "@reduxjs/toolkit";

export const exportSlice = createSlice({
  name: "export",
  initialState: {
    isExporting: false,
    downloadImages: false,
    previewImages: false,
    showAvatars: false,
    name: "",
    statusText: "",
    isGenerating: false,
    currentPage: 1,
    messagesPerPage: 1000,
    sortOverride: "desc",
  },
  reducers: {
    setSortOverride: (state, { payload }) => {
      state.sortOverride = payload;
    },
    setMessagesPerPage: (state, { payload }) => {
      state.messagesPerPage = payload;
    },
    setCurrentPage: (state, { payload }) => {
      state.currentPage = payload;
    },
    setIsGenerating: (state, { payload }) => {
      state.isGenerating = payload;
    },
    setIsExporting: (state, { payload }) => {
      state.isExporting = payload;
    },
    setShowAvatars: (state, { payload }) => {
      state.showAvatars = payload;
    },
    setPreviewImages: (state, { payload }) => {
      state.previewImages = payload;
    },
    setDownloadImages: (state, { payload }) => {
      state.downloadImages = payload;
    },
    setName: (state, { payload }) => {
      state.name = payload;
    },
    setStatusText: (state, { payload }) => {
      state.statusText = payload;
    },
  },
});

export const {
  setSortOverride,
  setMessagesPerPage,
  setCurrentPage,
  setIsGenerating,
  setIsExporting,
  setShowAvatars,
  setPreviewImages,
  setDownloadImages,
  setName,
  setStatusText,
} = exportSlice.actions;

export default exportSlice.reducer;
