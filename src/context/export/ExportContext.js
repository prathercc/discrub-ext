import React, { createContext, useReducer, useRef } from "react";
import { DmReducer } from "./ExportReducer";
import {
  SET_IS_EXPORTING,
  SET_DOWNLOAD_IMAGES,
  SET_NAME,
  SET_STATUS_TEXT,
  SET_IS_GENERATING,
  SET_PREVIEW_IMAGES,
  SET_SHOW_AVATARS,
  SET_CURRENT_PAGE,
  SET_MESSAGES_PER_PAGE,
} from "./ExportContextConstants";

export const ExportContext = createContext();

const ExportContextProvider = (props) => {
  const [state, dispatch] = useReducer(
    DmReducer,
    Object.freeze({
      isExporting: false,
      downloadImages: false,
      previewImages: false,
      showAvatars: false,
      name: "",
      statusText: "",
      isGenerating: false,
      currentPage: 1,
      messagesPerPage: 1000,
    })
  );
  const exportingRef = useRef();
  exportingRef.current = state.isExporting;

  const setMessagesPerPage = async (val) => {
    return dispatch({
      type: SET_MESSAGES_PER_PAGE,
      payload: { messagesPerPage: val },
    });
  };

  const setCurrentPage = async (val) => {
    return dispatch({
      type: SET_CURRENT_PAGE,
      payload: { currentPage: val },
    });
  };

  const setIsGenerating = async (val) => {
    return dispatch({
      type: SET_IS_GENERATING,
      payload: { isGenerating: val },
    });
  };

  const setIsExporting = async (val) => {
    return dispatch({ type: SET_IS_EXPORTING, payload: { isExporting: val } });
  };

  const setShowAvatars = async (val) => {
    return dispatch({
      type: SET_SHOW_AVATARS,
      payload: { showAvatars: val },
    });
  };

  const setPreviewImages = async (val) => {
    return dispatch({
      type: SET_PREVIEW_IMAGES,
      payload: { previewImages: val },
    });
  };

  const setDownloadImages = async (val) => {
    return dispatch({
      type: SET_DOWNLOAD_IMAGES,
      payload: { downloadImages: val },
    });
  };
  const setName = async (val) => {
    return dispatch({ type: SET_NAME, payload: { name: val } });
  };

  const setStatusText = async (val) => {
    return dispatch({ type: SET_STATUS_TEXT, payload: { statusText: val } });
  };

  return (
    <ExportContext.Provider
      value={{
        state,
        dispatch,
        setIsExporting,
        setDownloadImages,
        setName,
        setStatusText,
        setIsGenerating,
        setPreviewImages,
        setShowAvatars,
        setCurrentPage,
        setMessagesPerPage,
      }}
    >
      {props.children}
    </ExportContext.Provider>
  );
};

export default ExportContextProvider;
