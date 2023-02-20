import React, { createContext, useReducer, useRef } from "react";
import { DmReducer } from "./ExportReducer";
import {
  SET_IS_EXPORTING,
  SET_DOWNLOAD_IMAGES,
  SET_NAME,
  SET_STATUS_TEXT,
  SET_IS_GENERATING,
  SET_PREVIEW_IMAGES,
} from "./ExportContextConstants";

export const ExportContext = createContext();

const ExportContextProvider = (props) => {
  const [state, dispatch] = useReducer(
    DmReducer,
    Object.freeze({
      isExporting: false,
      downloadImages: true,
      previewImages: false,
      name: "",
      statusText: "",
      isGenerating: false,
    })
  );
  const exportingRef = useRef();
  exportingRef.current = state.isExporting;

  const setIsGenerating = async (val) => {
    return dispatch({
      type: SET_IS_GENERATING,
      payload: { isGenerating: val },
    });
  };

  const setIsExporting = async (val) => {
    return dispatch({ type: SET_IS_EXPORTING, payload: { isExporting: val } });
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
      }}
    >
      {props.children}
    </ExportContext.Provider>
  );
};

export default ExportContextProvider;
