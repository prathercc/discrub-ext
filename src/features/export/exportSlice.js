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
import { MessageRegex } from "../../enum/MessageRegex";
import { Typography } from "@mui/material";

const defaultMaps = {
  userMap: {}, // { id: { userName: null, guilds: { guildId: { roles: [] } } } }
  emojiMap: {},
  avatarMap: {},
  mediaMap: {},
  nonMediaMap: {},
  roleMap: {},
};

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
    exportMaps: defaultMaps,
  },
  reducers: {
    setExportMaps: (state, { payload }) => {
      state.exportMaps = { ...state.exportMaps, ...payload };
    },
    resetExportMaps: (state, { payload }) => {
      if (Boolean(payload?.length)) {
        payload.forEach((mapName) => {
          state.exportMaps[mapName] = {};
        });
      } else {
        state.exportMaps = defaultMaps;
      }
    },
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
  setExportMaps,
  resetExportMaps,
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
      const isMedia = entity.isMedia();
      const path = isMedia ? mediaPath : nonMediaPath;
      const downloadUrls = isMedia
        ? entity.getMediaDownloadUrls()
        : [entity.getNonMediaUrl()].filter(Boolean);

      for (const downloadUrl of downloadUrls) {
        if (dispatch(getDiscrubCancelled())) break;
        await dispatch(checkDiscrubPaused());
        const { exportMaps } = getState().export;
        const mapName = isMedia ? "mediaMap" : "nonMediaMap";
        const map = exportMaps[mapName];
        try {
          if (!Boolean(map[downloadUrl])) {
            const blob = await fetch(downloadUrl).then((r) => r.blob());
            if (blob.size) {
              const blobType = blob.type?.split("/")?.[1];
              const fileName = entity.getExportFileName(blobType);
              await exportUtils.addToZip(blob, `${path}/${fileName}`);
              dispatch(
                setExportMaps({
                  [mapName]: {
                    ...map,
                    [downloadUrl]: `${path.split("/")[1]}/${fileName}`,
                  },
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
    const { exportMaps } = getState().export;
    const { id: userId, avatar: avatarId } = message?.getAuthor();
    const idAndAvatar = `${userId}/${avatarId}`;

    try {
      if (!exportMaps.avatarMap[idAndAvatar]) {
        const blob = await fetch(message?.getAvatarUrl()).then((r) => r.blob());
        if (blob.size) {
          const fileExt = blob.type?.split("/")?.[1] || "webp";
          const avatarFilePath = `avatars/${idAndAvatar}.${fileExt}`;
          await exportUtils.addToZip(blob, avatarFilePath);

          dispatch(
            setExportMaps({
              avatarMap: {
                ...exportMaps.avatarMap,
                [idAndAvatar]: avatarFilePath,
              },
            })
          );
        }
      }
    } catch (e) {
      console.error("Failed to download avatar from message", e, message);
    }
  };

/**
 *
 * @param {String} content String content to parse Discord special formatting
 * @returns An Object of special formatting
 */
const _getSpecialFormatting = (content) => (dispatch, getState) => {
  const { userMap } = getState().export.exportMaps;

  return {
    userMention: Array.from(content.matchAll(MessageRegex.USER_MENTION))?.map(
      ({ 0: userMentionRef, groups: userMentionGroups }) => {
        const userId = userMentionGroups?.user_id;
        return {
          raw: userMentionRef,
          userName: userMap[userId]?.userName || "Deleted User",
          id: userId,
        };
      }
    ),
    channel: Array.from(content.matchAll(MessageRegex.CHANNEL_MENTION))?.map(
      ({ 0: channelRef, groups: channelGroups }) => {
        return { channelId: channelGroups?.channel_id, raw: channelRef };
      }
    ),
    underLine: Array.from(content.matchAll(MessageRegex.UNDER_LINE))?.map(
      ({ 0: underLineRef, groups: underLineGroups }) => {
        return {
          text: underLineGroups?.text?.replaceAll("__", "") || "",
          raw: underLineRef,
        };
      }
    ),
    code: Array.from(content.matchAll(MessageRegex.CODE))?.map(
      ({ 0: codeRef, groups: codeGroups }) => {
        return {
          text: codeGroups?.text?.replaceAll("```", "") || "",
          raw: codeRef,
        };
      }
    ),
    italics: Array.from(content.matchAll(MessageRegex.ITALICS))?.map(
      ({ 0: italicRef, groups: italicGroups }) => {
        return {
          text: italicGroups?.text?.replaceAll("_", "") || "",
          raw: italicRef,
        };
      }
    ),
    bold: Array.from(content.matchAll(MessageRegex.BOLD))?.map(
      ({ 0: boldRef, groups: boldGroups }) => {
        return {
          text: boldGroups?.text?.replaceAll("**", "") || "",
          raw: boldRef,
        };
      }
    ),
    link: Array.from(content.matchAll(MessageRegex.LINK))?.map(
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
    quote: content.match(MessageRegex.QUOTE)?.map((quoteRef) => ({
      text: quoteRef?.split("`")[1],
      raw: quoteRef,
    })),
    hyperLink: content.match(MessageRegex.HYPER_LINK)?.map((hyperLinkRef) => ({
      raw: hyperLinkRef?.trim(),
    })),
    emoji: content.match(MessageRegex.EMOJI)?.map((emojiRef) => ({
      raw: emojiRef,
      name: `:${emojiRef.split(":")[1]}:`,
      id: emojiRef.split(":")[2].replace(">", ""),
    })),
  };
};

const _getEmoji =
  ({ name, id }, isReply, exportView) =>
  (dispatch, getState) => {
    const { emojiMap } = getState().export.exportMaps;
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

    const { emoji } = dispatch(_getSpecialFormatting(rawHtml));
    if (Boolean(emoji?.length)) {
      emoji.forEach((emojiRef) => {
        rawHtml = rawHtml.replaceAll(
          emojiRef.raw,
          renderToString(dispatch(_getEmoji(emojiRef, isReply, exportView)))
        );
      });
    }

    const { link } = dispatch(_getSpecialFormatting(rawHtml));
    if (Boolean(link?.length)) {
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

    const { hyperLink } = dispatch(_getSpecialFormatting(rawHtml));
    if (Boolean(hyperLink?.length)) {
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

    const { bold } = dispatch(_getSpecialFormatting(rawHtml));
    if (Boolean(bold?.length)) {
      bold.forEach((boldRef) => {
        rawHtml = rawHtml.replaceAll(
          boldRef.raw,
          renderToString(
            <strong dangerouslySetInnerHTML={{ __html: boldRef.text }} />
          )
        );
      });
    }

    const { code } = dispatch(_getSpecialFormatting(rawHtml));
    if (Boolean(code?.length)) {
      code.forEach((codeRef) => {
        rawHtml = rawHtml.replaceAll(
          codeRef.raw,
          renderToString(
            <div
              style={{
                backgroundColor: "#2b2d31",
                borderRadius: 5,
                padding: "7px",
                border: "1px solid #1e1f22",
                whiteSpace: "pre-line",
                color: "rgb(220, 221, 222) !important",
                minWidth: "400px",
              }}
            >
              <Typography>{codeRef.text?.trim()}</Typography>
            </div>
          )
        );
      });
    }

    const { quote } = dispatch(_getSpecialFormatting(rawHtml));
    if (Boolean(quote?.length)) {
      quote.forEach((quoteRef) => {
        rawHtml = rawHtml.replaceAll(
          quoteRef.raw,
          renderToString(
            <span
              style={{
                backgroundColor: "#242529",
                borderRadius: 5,
                padding: "3px",
              }}
              dangerouslySetInnerHTML={{ __html: quoteRef.text }}
            />
          )
        );
      });
    }

    const { underLine } = dispatch(_getSpecialFormatting(rawHtml));
    if (Boolean(underLine?.length)) {
      underLine.forEach((underLineRef) => {
        rawHtml = rawHtml.replaceAll(
          underLineRef.raw,
          renderToString(
            <span
              style={{
                textDecoration: "underline",
              }}
              dangerouslySetInnerHTML={{ __html: underLineRef.text }}
            />
          )
        );
      });
    }

    const { italics } = dispatch(_getSpecialFormatting(rawHtml));
    if (Boolean(italics?.length)) {
      italics.forEach((italicsRef) => {
        rawHtml = rawHtml.replaceAll(
          italicsRef.raw,
          renderToString(
            <span
              style={{
                fontStyle: "italic",
              }}
              dangerouslySetInnerHTML={{ __html: italicsRef.text }}
            />
          )
        );
      });
    }

    const { channel } = dispatch(_getSpecialFormatting(rawHtml));
    if (Boolean(channel?.length)) {
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

    const { userMention } = dispatch(_getSpecialFormatting(rawHtml));
    if (Boolean(userMention?.length)) {
      userMention.forEach((userMentionRef) => {
        rawHtml = rawHtml.replaceAll(
          userMentionRef.raw,
          renderToString(
            <span
              title={userMentionRef.id}
              style={{
                backgroundColor: "#4a4b6f",
                padding: "0 2px",
                borderRadius: "5px",
              }}
              dangerouslySetInnerHTML={{
                __html: `@${userMentionRef.userName}`,
              }}
            />
          )
        );
      });
    }

    return rawHtml;
  };

const _downloadEmojisFromMessage =
  (message, exportUtils) => async (dispatch, getState) => {
    const { emoji: emojiReferences } = dispatch(
      _getSpecialFormatting(message.getContent())
    );
    if (Boolean(emojiReferences?.length)) {
      for (const { id, name } of emojiReferences) {
        if (dispatch(getDiscrubCancelled())) break;
        await dispatch(checkDiscrubPaused());
        const { exportMaps } = getState().export;
        try {
          if (!exportMaps.emojiMap[id]) {
            const blob = await fetch(
              `https://cdn.discordapp.com/emojis/${id}`
            ).then((r) => r.blob());
            if (blob.size) {
              const fileExt = blob.type?.split("/")?.[1] || "gif";
              const emojiFilePath = `emojis/${name.replaceAll(
                ":",
                ""
              )}-${id}.${fileExt}`;
              await exportUtils.addToZip(blob, emojiFilePath);

              dispatch(
                setExportMaps({
                  emojiMap: { ...exportMaps.emojiMap, [id]: emojiFilePath },
                })
              );
            }
          }
        } catch (e) {
          console.error("Failed to download emojis from message", e, message);
        }
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
    dispatch(
      resetExportMaps(["emojiMap", "avatarMap", "mediaMap", "nonMediaMap"])
    );
  };

export const selectExport = (state) => state.export;

export default exportSlice.reducer;
