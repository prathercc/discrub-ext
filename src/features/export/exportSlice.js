import { createSlice } from "@reduxjs/toolkit";
import { getMessageData, resetMessageData } from "../message/messageSlice";
import { v4 as uuidv4 } from "uuid";
import { sortByProperty, wait } from "../../utils";
import { resetChannel, setChannel } from "../channel/channelSlice";
import {
  checkDiscrubPaused,
  getDiscrubCancelled,
  setDiscrubCancelled,
} from "../app/appSlice";

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
    emojiMap: {},
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
    resetExportSettings: (state, { payload }) => {
      state.downloadImages = false;
      state.showAvatars = false;
      state.previewImages = false;
      state.sortOverride = "desc";
      state.messagesPerPage = 1000;
    },
    setEmojiMap: (state, { payload }) => {
      state.emojiMap = payload;
    },
    resetEmojiMap: (state, { payload }) => {
      state.emojiMap = {};
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
  resetExportSettings,
  setEmojiMap,
  resetEmojiMap,
} = exportSlice.actions;

/**
 *
 * @param Object An Attachment/Embed object
 * @returns The download URL for the given entity
 */
const _getDownloadUrl = (entity) => {
  switch (entity.type) {
    case "gifv":
      return entity.video.proxy_url;
    case "image":
      return entity.thumbnail.proxy_url;
    case "video":
      return null; // We do not want to download video embeds
    default:
      return entity.proxy_url;
  }
};

export const getEmojiReferences = (content) => {
  const emojiRegex = /<a:[A-Za-z0-9]+:[0-9]+>|<:[A-Za-z0-9]+:[0-9]+>/g;
  return (
    content.match(emojiRegex)?.map((emojiRef) => ({
      raw: emojiRef,
      name: `:${emojiRef.split(":")[1]}:`,
      id: emojiRef.split(":")[2].replace(">", ""),
    })) || []
  );
};

const _downloadEmojisFromMessage =
  (message, exportUtils) => async (dispatch, getState) => {
    const emojiReferences = getEmojiReferences(message.content);

    for (let count = 0; count < emojiReferences.length; count += 1) {
      if (dispatch(getDiscrubCancelled())) break;
      await dispatch(checkDiscrubPaused());
      const { emojiMap } = getState().export;
      const { id: parsedEmojiId, name: parsedEmojiName } =
        emojiReferences[count];

      try {
        if (!emojiMap[parsedEmojiId]) {
          const blob = await fetch(
            `https://cdn.discordapp.com/emojis/${parsedEmojiId}`
          ).then((r) => r.blob());
          if (blob.size) {
            const fileExt = blob.type?.split("/")?.[1] || ".gif";
            const emojiFilePath = `emojis/${parsedEmojiName.replaceAll(
              ":",
              ""
            )}-${parsedEmojiId}.${fileExt}`;
            await exportUtils.addToZip(blob, emojiFilePath);
            dispatch(
              setEmojiMap({ ...emojiMap, [parsedEmojiId]: emojiFilePath })
            );
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

const _downloadCollection =
  (
    collection = [],
    collectionName = "",
    message = {},
    imgPath = "",
    exportUtils
  ) =>
  async (dispatch, getState) => {
    for (let c2 = 0; c2 < collection.length; c2 += 1) {
      if (dispatch(getDiscrubCancelled())) break;
      await dispatch(checkDiscrubPaused());
      try {
        const entity = message[collectionName][c2];
        const downloadUrl = _getDownloadUrl(entity);
        if (downloadUrl) {
          const blob = await fetch(downloadUrl).then((r) => r.blob());
          if (blob.size) {
            // TODO: We really should create Embed/Attachment getFileName functions instead of doing this
            let cleanFileName;
            if (entity.filename) {
              const fNameSplit = entity.filename.split(".");
              const fileExt = fNameSplit.pop();
              cleanFileName = `${fNameSplit.join(".")}_${uuidv4()}.${fileExt}`;
            } else {
              const blobType = blob.type?.split("/")?.[1];
              cleanFileName = `${
                entity.title ? `${entity.title}_` : ""
              }${uuidv4()}.${blobType}`;
            }
            await exportUtils.addToZip(blob, `${imgPath}/${cleanFileName}`);

            message[collectionName][c2] = Object.assign(
              message[collectionName][c2],
              { local_url: `${imgPath.split("/")[1]}/${cleanFileName}` }
            );
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

const _processMessages =
  (messages, imgPath, exportUtils) => async (dispatch, getState) => {
    const processMessage = async (message) => {
      let updatedMessage = message;
      if (imgPath) {
        await dispatch(
          _downloadCollection(
            updatedMessage.attachments,
            "attachments",
            updatedMessage,
            imgPath,
            exportUtils
          )
        );
        await dispatch(
          _downloadCollection(
            updatedMessage.embeds,
            "embeds",
            updatedMessage,
            imgPath,
            exportUtils
          )
        );
      } else {
        updatedMessage.attachments = updatedMessage.attachments?.map(
          (attachment) => ({ ...attachment, local_url: null })
        );
      }
      await dispatch(_downloadEmojisFromMessage(message, exportUtils));
      return updatedMessage;
    };
    const retArr = [];
    for (let c1 = 0; c1 < messages.length; c1 += 1) {
      if (c1 === 0) {
        await wait(3);
      }
      if (dispatch(getDiscrubCancelled())) break;
      await dispatch(checkDiscrubPaused());
      retArr.push(await processMessage(messages[c1]));
      if (c1 % 100 === 0) {
        dispatch(
          setStatusText(
            `Processing - ${
              ((c1 / messages.length) * 100).toString().split(".")[0]
            }%`
          )
        );
        await wait(0.1);
      }
    }

    return retArr;
  };

const _compressMessages =
  (
    updatedMessages,
    format,
    entityName,
    entityMainDirectory,
    bulk,
    exportUtils
  ) =>
  async (dispatch, getState) => {
    const { sortOverride, messagesPerPage } = getState().export;
    dispatch(
      setStatusText(
        `Compressing${
          updatedMessages.length > 2000 ? " - This may take a while..." : ""
        }`
      )
    );
    await wait(5);

    if (format === "json")
      return await exportUtils.addToZip(
        new Blob(
          [
            JSON.stringify(
              bulk
                ? updatedMessages.toSorted((a, b) =>
                    sortByProperty(
                      Object.assign(a, { date: new Date(a.timestamp) }),
                      Object.assign(b, { date: new Date(b.timestamp) }),
                      "date",
                      sortOverride
                    )
                  )
                : updatedMessages
            ),
          ],
          {
            type: "text/plain",
          }
        ),
        `${entityMainDirectory}/${entityName}.json`
      );
    else {
      const totalPages =
        updatedMessages.length > messagesPerPage
          ? Math.ceil(updatedMessages.length / messagesPerPage)
          : 1;
      while (
        getState().export.currentPage <= totalPages &&
        !dispatch(getDiscrubCancelled())
      ) {
        const currentPage = getState().export.currentPage;
        await dispatch(checkDiscrubPaused());
        dispatch(
          setStatusText(`Compressing - Page ${currentPage} of ${totalPages}`)
        );
        await wait(2);
        const startIndex =
          currentPage === 1 ? 0 : (currentPage - 1) * messagesPerPage;
        exportUtils.setExportMessages(
          updatedMessages?.slice(startIndex, startIndex + messagesPerPage)
        );
        const htmlBlob = await exportUtils.generateHTML();
        await exportUtils.addToZip(
          htmlBlob,
          `${entityMainDirectory}/${entityName}_page_${currentPage}.html`
        );
        await dispatch(setCurrentPage(currentPage + 1));
      }
      return dispatch(setCurrentPage(1));
    }
  };

export const exportMessages =
  (selectedChannels, exportUtils, bulk = false, format = "json") =>
  async (dispatch, getState) => {
    let count = 0;
    const { messages: contextMessages, filteredMessages } = getState().message;
    const { selectedGuild } = getState().guild;
    const { messagesPerPage, downloadImages } = getState().export;
    const { preFilterUserId } = getState().channel;
    const { preFilterUserId: dmPreFilterUserId } = getState().dm;

    while (
      count < selectedChannels.length &&
      !dispatch(getDiscrubCancelled())
    ) {
      dispatch(setStatusText(null));
      const entity = selectedChannels[count];
      const entityMainDirectory = `${entity.name}_${uuidv4()}`;
      dispatch(setIsExporting(true));
      dispatch(setName(entity.name));
      if (bulk && !entity.isDm()) {
        dispatch(setChannel(entity.id));
      }
      const { messages } = bulk
        ? await dispatch(
            getMessageData(
              selectedGuild?.id,
              entity.id,
              preFilterUserId || dmPreFilterUserId
            )
          )
        : {
            messages: filteredMessages.length
              ? filteredMessages
              : contextMessages,
          };

      const imgPath = downloadImages
        ? `${entityMainDirectory}/${entity.name}_images`
        : null;

      const updatedMessages = await dispatch(
        _processMessages(messages, imgPath, exportUtils)
      );

      if (messagesPerPage === null || messagesPerPage === 0)
        await dispatch(setMessagesPerPage(updatedMessages.length));

      if (updatedMessages.length > 0) {
        if (dispatch(getDiscrubCancelled())) break;
        await dispatch(checkDiscrubPaused());
        await dispatch(
          _compressMessages(
            updatedMessages,
            format,
            entity.name,
            entityMainDirectory,
            bulk,
            exportUtils
          )
        );
      }

      count += 1;
      if (dispatch(getDiscrubCancelled())) break;
      await dispatch(checkDiscrubPaused());
    }
    await dispatch(checkDiscrubPaused());
    if (!dispatch(getDiscrubCancelled())) {
      dispatch(setStatusText("Preparing Archive"));
      await exportUtils.generateZip();
    }

    /*
     * We need to ensure that the Selected Channel and Message Data gets reset if we are bulk exporting.
     * Keep in mind, only Guilds can be bulk exported at the moment! The resetChannel call may need to moved.
     */
    if (bulk) dispatch(resetChannel());
    if (bulk) dispatch(resetMessageData());
    /* */

    dispatch(setIsGenerating(false));
    dispatch(setIsExporting(false));
    dispatch(setName(""));
    await exportUtils.resetZip();
    dispatch(setStatusText(null));
    dispatch(setCurrentPage(1));
    dispatch(setDiscrubCancelled(false));
    dispatch(resetEmojiMap());
  };

export const selectExport = (state) => state.export;

export default exportSlice.reducer;
