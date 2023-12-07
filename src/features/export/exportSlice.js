import { createSlice } from "@reduxjs/toolkit";
import { getMessageData, resetMessageData } from "../message/messageSlice";
import { v4 as uuidv4 } from "uuid";
import { getPercent, sortByProperty, wait } from "../../utils";
import { resetChannel, setChannel } from "../channel/channelSlice";
import {
  checkDiscrubPaused,
  getDiscrubCancelled,
  setDiscrubCancelled,
} from "../app/appSlice";
import { renderToString } from "react-dom/server";
import ExportSliceStyles from "./styles/ExportSliceStyles";
import classNames from "classnames";

export const exportSlice = createSlice({
  name: "export",
  initialState: {
    isExporting: false,
    downloadImages: false,
    previewImages: false,
    downloadFiles: false, // Discord does not currently allow us to download non-media attachments cross-origin.
    name: "",
    statusText: "",
    isGenerating: false,
    currentPage: 1,
    messagesPerPage: 1000,
    sortOverride: "desc",
    emojiMap: {},
    avatarMap: {},
    mediaMap: {},
    nonMediaMap: {},
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
    setPreviewImages: (state, { payload }) => {
      state.previewImages = payload;
    },
    setDownloadImages: (state, { payload }) => {
      state.downloadImages = payload;
    },
    setDownloadFiles: (state, { payload }) => {
      state.downloadFiles = payload;
    },
    setName: (state, { payload }) => {
      state.name = payload;
    },
    setStatusText: (state, { payload }) => {
      state.statusText = payload;
    },
    resetExportSettings: (state, { payload }) => {
      state.downloadFiles = false;
      state.downloadImages = false;
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
    setAvatarMap: (state, { payload }) => {
      state.avatarMap = payload;
    },
    resetAvatarMap: (state, { payload }) => {
      state.avatarMap = {};
    },
    setMediaMap: (state, { payload }) => {
      state.mediaMap = payload;
    },
    resetMediaMap: (state, { payload }) => {
      state.mediaMap = {};
    },
    setNonMediaMap: (state, { payload }) => {
      state.mediaMap = payload;
    },
    resetNonMediaMap: (state, { payload }) => {
      state.nonMediaMap = {};
    },
  },
});

export const {
  setSortOverride,
  setMessagesPerPage,
  setCurrentPage,
  setIsGenerating,
  setIsExporting,
  setPreviewImages,
  setDownloadImages,
  setDownloadFiles,
  setName,
  setStatusText,
  resetExportSettings,
  setEmojiMap,
  resetEmojiMap,
  setAvatarMap,
  resetAvatarMap,
  setMediaMap,
  resetMediaMap,
  setNonMediaMap,
  resetNonMediaMap,
} = exportSlice.actions;

const _downloadFilesFromMessage =
  (message, exportUtils, paths = { media: null, non_media: null }) =>
  async (dispatch, getState) => {
    const { downloadImages, downloadFiles } = getState().export;
    let embeds = message.getEmbeds();
    let attachments = message.getAttachments();
    if (!downloadImages) {
      embeds = [];
      attachments = attachments.filter((attachment) => !attachment.isMedia());
    }
    if (!downloadFiles) {
      attachments = attachments.filter((attachment) => attachment.isMedia());
    }

    const { media: mediaPath, non_media: nonMediaPath } = paths;

    for (const entity of [...embeds, ...attachments]) {
      const setMap = entity.isMedia() ? setMediaMap : setNonMediaMap;
      const path = entity.isMedia() ? mediaPath : nonMediaPath;
      const downloadUrls = entity.isMedia()
        ? entity.getMediaDownloadUrls()
        : [entity.getNonMediaUrl()].filter(Boolean);

      for (const downloadUrl of downloadUrls) {
        if (dispatch(getDiscrubCancelled())) break;
        await dispatch(checkDiscrubPaused());
        const { mediaMap, nonMediaMap } = getState().export;
        const map = entity.isMedia() ? mediaMap : nonMediaMap;
        try {
          if (!Boolean(map[downloadUrl])) {
            const blob = await fetch(downloadUrl).then((r) => r.blob());
            if (blob.size) {
              const blobType = blob.type?.split("/")?.[1];
              const fileName = entity.getExportFileName(blobType);
              await exportUtils.addToZip(blob, `${path}/${fileName}`);
              dispatch(
                setMap({
                  ...map,
                  [downloadUrl]: `${path.split("/")[1]}/${fileName}`,
                })
              );
            }
          }
        } catch (e) {
          console.error(`Failed to download from: ${downloadUrl}`, e, message);
        }
      }
    }
  };

const _downloadAvatarFromMessage =
  (message, exportUtils) => async (dispatch, getState) => {
    const { avatarMap } = getState().export;
    const { id: userId, avatar: avatarId } = message?.getAuthor();
    const idAndAvatar = `${userId}/${avatarId}`;

    try {
      if (!avatarMap[idAndAvatar]) {
        const blob = await fetch(message?.getAvatarUrl()).then((r) => r.blob());
        if (blob.size) {
          const fileExt = blob.type?.split("/")?.[1] || "webp";
          const avatarFilePath = `avatars/${idAndAvatar}.${fileExt}`;
          await exportUtils.addToZip(blob, avatarFilePath);
          dispatch(
            setAvatarMap({ ...avatarMap, [idAndAvatar]: avatarFilePath })
          );
        }
      }
    } catch (e) {
      console.error("Failed to download avatar from message", e, message);
    }
  };

const _getEmojiReferences = (content) => {
  const emojiRegex = /<a:[^<>]+:[0-9]+>|<:[^<>]+:[0-9]+>/g;
  return (
    content.match(emojiRegex)?.map((emojiRef) => ({
      raw: emojiRef,
      name: `:${emojiRef.split(":")[1]}:`,
      id: emojiRef.split(":")[2].replace(">", ""),
    })) || []
  );
};

/**
 *
 * @param {String} content String content to parse bold and link formatting
 * @returns An Object of special formatting
 */
const _getSpecialFormatting = (content) => {
  const boldRegex = /\*\*(?<text>.*)(?=(\*\*))\*\*/g;
  const linkRegex =
    /(?:(?<name>\[[^\]]+\])(?<url>\([^ )]+)?(?<description>[^[]*(?=(?:'|")\))'\))?)/g;
  const backTickRegex = /`([^`]*)`/g; // This is quote
  const channelRegex = /<#(?<channel_id>\d+)>/g;
  const hyperLinkRegex = /(^|\s)(http(s)?:\/\/)+[^\s]+(?=[\s])?/g;
  // TODO: Parse User mentions here, remove parseMentions
  // TODO: Parse italics here: _TEXT_
  // TODO: Parse underlines here: __TEXT__
  // TODO: Parse code: ```TEXT```

  return {
    channel: Array.from(content.matchAll(channelRegex))?.map(
      ({ 0: channelRef, groups: channelGroups }) => {
        return { channelId: channelGroups?.channel_id, raw: channelRef };
      }
    ),
    bold: Array.from(content.matchAll(boldRegex))?.map(
      ({ 0: boldRef, groups: boldGroups }) => {
        return {
          text: boldGroups?.text?.replaceAll("**", "") || "",
          raw: boldRef,
        };
      }
    ),
    link: Array.from(content.matchAll(linkRegex))?.map(
      ({ 0: linkRef, groups: linkGroups }) => {
        const rawUrl = linkGroups?.url || null;
        const rawText = linkGroups?.name || null;
        const rawDescription = linkGroups?.description?.trim() || null;
        return {
          url: rawUrl ? rawUrl.slice(1) : "",
          text: rawText ? rawText?.slice(1, rawText.length - 1) : "",
          description: rawDescription
            ? rawDescription?.slice(1, rawDescription.length - 2)
            : "",
          raw: `${linkRef}${rawDescription ? "" : ")"}`,
        };
      }
    ),
    backTick: content.match(backTickRegex)?.map((backTickRef) => ({
      text: backTickRef?.split("`")[1],
      raw: backTickRef,
    })),
    hyperLink: content.match(hyperLinkRegex)?.map((hyperLinkRef) => ({
      raw: hyperLinkRef?.trim(),
    })),
  };
};

const _getEmoji =
  ({ name, id }, isReply, exportView) =>
  (dispatch, getState) => {
    const { emojiMap } = getState().export;
    const classes = ExportSliceStyles();
    let emojiUrl = `https://cdn.discordapp.com/emojis/${id}`;
    if (emojiMap && emojiMap[id] && exportView) {
      emojiUrl = `../${emojiMap[id]}`;
    }

    return (
      <img
        title={!isReply ? name : null}
        id={name}
        src={`${emojiUrl}`}
        alt={name}
        className={classNames(classes.emoji, {
          [classes.emojiImgDefault]: !isReply,
          [classes.emojiImgSmall]: isReply,
        })}
      />
    );
  };

/**
 *
 * @param {String} content String content to get formatted html from
 * @returns Html in String format
 */
export const getFormattedInnerHtml =
  (content, isReply = false, exportView = false) =>
  (dispatch, getState) => {
    let rawHtml = content || "";

    const emoji = _getEmojiReferences(rawHtml);
    if (emoji.length) {
      emoji.forEach((emojiRef) => {
        rawHtml = rawHtml.replaceAll(
          emojiRef.raw,
          renderToString(dispatch(_getEmoji(emojiRef, isReply, exportView)))
        );
      });
    }

    const { link } = _getSpecialFormatting(rawHtml);
    if (link?.length) {
      link.forEach((linkRef) => {
        rawHtml = rawHtml.replaceAll(
          linkRef.raw,
          renderToString(
            <a
              style={{
                textDecoration: "none",
                color: "rgb(0, 168, 252)",
                cursor: "pointer !important",
              }}
              href={linkRef.url}
              target="_blank"
              alt={"link-to"}
              rel="noreferrer"
              title={linkRef.description}
              dangerouslySetInnerHTML={{ __html: linkRef.text }}
            />
          )
        );
      });
    }

    const { hyperLink } = _getSpecialFormatting(rawHtml);
    if (hyperLink?.length) {
      hyperLink.forEach((hyperLinkRef) => {
        rawHtml = rawHtml.replaceAll(
          hyperLinkRef.raw,
          renderToString(
            <a
              style={{
                textDecoration: "none",
                color: "rgb(0, 168, 252)",
                cursor: "pointer !important",
              }}
              href={hyperLinkRef.raw}
              target="_blank"
              alt={"link-to"}
              rel="noreferrer"
              title={hyperLinkRef.raw}
              dangerouslySetInnerHTML={{ __html: hyperLinkRef.raw }}
            />
          )
        );
      });
    }

    const { bold } = _getSpecialFormatting(rawHtml);
    if (bold?.length) {
      bold.forEach((boldRef) => {
        rawHtml = rawHtml.replaceAll(
          boldRef.raw,
          renderToString(
            <strong dangerouslySetInnerHTML={{ __html: boldRef.text }} />
          )
        );
      });
    }

    const { backTick } = _getSpecialFormatting(rawHtml);
    if (backTick?.length) {
      backTick.forEach((backTickRef) => {
        rawHtml = rawHtml.replaceAll(
          backTickRef.raw,
          renderToString(
            <span
              style={{
                backgroundColor: "#242529",
                borderRadius: 5,
                padding: "3px",
              }}
              dangerouslySetInnerHTML={{ __html: backTickRef.text }}
            />
          )
        );
      });
    }

    const { channel } = _getSpecialFormatting(rawHtml);
    if (channel?.length) {
      channel.forEach((channelRef) => {
        const { channels } = getState().channel;
        const channelName =
          channels.find((c) => c.id === channelRef.channelId)?.name ||
          "Channel Not Found";
        rawHtml = rawHtml.replaceAll(
          channelRef.raw,
          renderToString(
            <span
              style={{
                backgroundColor: "#3c4270",
                padding: "0 2px",
                borderRadius: "5px",
              }}
              dangerouslySetInnerHTML={{ __html: `# ${channelName}` }}
            />
          )
        );
      });
    }

    return rawHtml;
  };

const _downloadEmojisFromMessage =
  (message, exportUtils) => async (dispatch, getState) => {
    const emojiReferences = _getEmojiReferences(message.content);

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
            const fileExt = blob.type?.split("/")?.[1] || "gif";
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
        console.error("Failed to download emojis from message", e, message);
      }
    }
  };

const _processMessages =
  (messages, paths, exportUtils) => async (dispatch, getState) => {
    for (const [i, msg] of messages.entries()) {
      await wait(!Boolean(i) ? 3 : 0);

      if (dispatch(getDiscrubCancelled())) break;
      await dispatch(checkDiscrubPaused());

      await dispatch(_downloadFilesFromMessage(msg, exportUtils, paths));
      await dispatch(_downloadEmojisFromMessage(msg, exportUtils));
      await dispatch(_downloadAvatarFromMessage(msg, exportUtils));

      if (i % 100 === 0) {
        const percent = getPercent(i, messages.length);
        dispatch(setStatusText(`Processing - ${percent}%`));
        await wait(0.1);
      }
    }
  };

const _compressMessages =
  (messages, format, entityName, entityMainDirectory, bulk, exportUtils) =>
  async (dispatch, getState) => {
    const { sortOverride, messagesPerPage } = getState().export;

    // TODO: Combine the setStatusText and wait calls within exportSlice.
    dispatch(
      setStatusText(
        `Compressing${
          messages.length > 2000 ? " - This may take a while..." : ""
        }`
      )
    );
    await wait(5);

    // TODO: Break this up into two new private functions.
    if (format === "json") {
      return await exportUtils.addToZip(
        new Blob(
          [
            JSON.stringify(
              bulk
                ? messages.toSorted((a, b) =>
                    sortByProperty(
                      Object.assign(a, { date: new Date(a.timestamp) }),
                      Object.assign(b, { date: new Date(b.timestamp) }),
                      "date",
                      sortOverride
                    )
                  )
                : messages
            ),
          ],
          {
            type: "text/plain",
          }
        ),
        `${entityMainDirectory}/${entityName}.json`
      );
    } else {
      const totalPages =
        messages.length > messagesPerPage
          ? Math.ceil(messages.length / messagesPerPage)
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
          messages?.slice(startIndex, startIndex + messagesPerPage)
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
    const { messages: contextMessages, filteredMessages } = getState().message;
    const { selectedGuild } = getState().guild;
    const { messagesPerPage } = getState().export;
    const { preFilterUserId } = getState().channel;
    const { preFilterUserId: dmPreFilterUserId } = getState().dm;

    for (const entity of selectedChannels) {
      if (dispatch(getDiscrubCancelled())) break;
      dispatch(setStatusText(null));
      const entityMainDirectory = `${entity.name}_${uuidv4()}`;
      dispatch(setIsExporting(true));
      dispatch(setName(entity.name));
      if (bulk && !entity.isDm()) {
        dispatch(setChannel(entity.id));
      }

      // TODO: Refactor this.
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
      //

      const mediaPath = `${entityMainDirectory}/${entity.name}_media`;
      const nonMediaPath = `${entityMainDirectory}/${entity.name}_non_media`;
      const paths = { media: mediaPath, non_media: nonMediaPath };

      await dispatch(_processMessages(messages, paths, exportUtils));

      if (messagesPerPage === null || messagesPerPage === 0)
        await dispatch(setMessagesPerPage(messages.length));

      if (messages.length > 0) {
        if (dispatch(getDiscrubCancelled())) break;
        await dispatch(checkDiscrubPaused());
        await dispatch(
          _compressMessages(
            messages,
            format,
            entity.name,
            entityMainDirectory,
            bulk,
            exportUtils
          )
        );
      }

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
    dispatch(resetAvatarMap());
    dispatch(resetMediaMap());
    dispatch(resetNonMediaMap());
  };

export const selectExport = (state) => state.export;

export default exportSlice.reducer;
