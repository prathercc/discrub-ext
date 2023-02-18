import React, { createContext, useReducer } from "react";
import { DmReducer } from "./ExportReducer";
import {
  SET_IS_EXPORTING,
  SET_DOWNLOAD_IMAGES,
  SET_NAME,
  SET_STATUS_TEXT,
  INCREMENT_PROCESSING_TIME,
  PROCESSING_MESSAGES_COMPLETE,
  START_PROCESSING_MESSAGES,
} from "./ExportContextConstants";

export const ExportContext = createContext();

const ExportContextProvider = (props) => {
  const [state, dispatch] = useReducer(
    DmReducer,
    Object.freeze({
      isExporting: false,
      downloadImages: true,
      name: "",
      statusText: "",
      processedMessages: [],
      isProcessing: false,
      processingTime: 1,
    })
  );
  const setIsExporting = async (val) => {
    return dispatch({ type: SET_IS_EXPORTING, payload: { isExporting: val } });
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

  const processMessages = async (addToFolder, messages, attachmentFolder) => {
    const _processMessage = async (message) => {
      let updatedMessage = { ...message };
      if (attachmentFolder) {
        for (let c2 = 0; c2 < updatedMessage.attachments.length; c2 += 1) {
          try {
            const attachment = updatedMessage.attachments[c2];
            const blob = await fetch(attachment.proxy_url).then((r) =>
              r.blob()
            );
            if (blob.size) {
              const cleanFileName = addToFolder(
                attachmentFolder,
                blob,
                attachment.filename
              );
              updatedMessage.attachments[c2] = {
                ...updatedMessage.attachments[c2],
                local_url: `${attachmentFolder.name}/${cleanFileName}`,
              };
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      return updatedMessage;
    };
    dispatch({
      type: START_PROCESSING_MESSAGES,
      payload: { processedMessages: [], isProcessing: true },
    });
    const retArr = await Promise.all(messages.map((m) => _processMessage(m)));
    return dispatch({
      type: PROCESSING_MESSAGES_COMPLETE,
      payload: {
        processedMessages: retArr,
        isProcessing: false,
        processingTime: 1,
      },
    });
  };

  const incrementProcessingTime = () => {
    return dispatch({
      type: INCREMENT_PROCESSING_TIME,
    });
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
        processMessages,
        incrementProcessingTime,
      }}
    >
      {props.children}
    </ExportContext.Provider>
  );
};

export default ExportContextProvider;
