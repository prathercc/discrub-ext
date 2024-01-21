import { createSlice } from "@reduxjs/toolkit";
import { getMessageData, resetMessageData } from "../message/message-slice";
import { v4 as uuidv4 } from "uuid";
import {
  entityContainsMedia,
  formatUserData,
  getAvatarUrl,
  getExportFileName,
  getIconUrl,
  getMediaUrls,
  getPercent,
  getRoleNames,
  getSafeExportName,
  isDm,
  sortByProperty,
  wait,
} from "../../utils";
import { resetChannel, setChannel } from "../channel/channel-slice";
import { checkDiscrubPaused, setDiscrubCancelled } from "../app/app-slice";
import { renderToString } from "react-dom/server";
import { MessageRegex } from "../../enum/message-regex";
import {
  AvatarFromMessageProps,
  CompressMessagesProps,
  EmojisFromMessageProps,
  ExportAvatarMap,
  ExportEmojiMap,
  ExportHtmlProps,
  ExportJsonProps,
  ExportMap,
  ExportMediaMap,
  ExportMessagesProps,
  ExportRoleMap,
  ExportState,
  ExportUserMap,
  FilesFromMessagesProps,
  FormattedInnerHtmlProps,
  GetEmojiProps,
  ProcessMessagesProps,
  SpecialFormatting,
} from "./export-types";
import { SortDirection } from "../../enum/sort-direction";
import { ExportType } from "../../enum/export-type";
import Message from "../../classes/message";
import ExportUtils from "./export-utils";
import { AppThunk } from "../../app/store";
import { downloadFile } from "../../services/discord-service";
import { ReactElement } from "react";
import { Typography } from "@mui/material";
import ImgEmoji from "./styled/img-emoji";

const initialMaps: ExportMap = {
  userMap: {},
  emojiMap: {},
  avatarMap: {},
  mediaMap: {},
  roleMap: {},
};

const initialState: ExportState = {
  isExporting: false,
  downloadImages: false,
  previewImages: false,
  name: "",
  statusText: "",
  isGenerating: false,
  currentPage: 1,
  messagesPerPage: 1000,
  sortOverride: SortDirection.DESCENDING,
  exportMaps: initialMaps,
};

export const exportSlice = createSlice({
  name: "export",
  initialState: initialState,
  reducers: {
    setExportUserMap: (
      state,
      { payload }: { payload: ExportUserMap }
    ): void => {
      state.exportMaps.userMap = payload;
    },
    setExportEmojiMap: (
      state,
      { payload }: { payload: ExportEmojiMap }
    ): void => {
      state.exportMaps.emojiMap = payload;
    },
    setExportAvatarMap: (
      state,
      { payload }: { payload: ExportAvatarMap }
    ): void => {
      state.exportMaps.avatarMap = payload;
    },
    setExportMediaMap: (
      state,
      { payload }: { payload: ExportMediaMap }
    ): void => {
      state.exportMaps.mediaMap = payload;
    },
    setExportRoleMap: (
      state,
      { payload }: { payload: ExportRoleMap }
    ): void => {
      state.exportMaps.roleMap = payload;
    },
    resetExportMaps: (state, { payload }: { payload: string[] }): void => {
      if (payload.length) {
        payload.forEach((mapName) => {
          switch (mapName) {
            case "userMap":
              state.exportMaps.userMap = initialMaps.userMap;
              break;
            case "emojiMap":
              state.exportMaps.emojiMap = initialMaps.emojiMap;
              break;
            case "avatarMap":
              state.exportMaps.avatarMap = initialMaps.avatarMap;
              break;
            case "mediaMap":
              state.exportMaps.mediaMap = initialMaps.mediaMap;
              break;
            case "roleMap":
              state.exportMaps.roleMap = initialMaps.roleMap;
              break;
            default:
              break;
          }
        });
      } else {
        state.exportMaps = initialMaps;
      }
    },
    setSortOverride: (state, { payload }: { payload: SortDirection }): void => {
      state.sortOverride = payload;
    },
    setMessagesPerPage: (state, { payload }: { payload: number }): void => {
      state.messagesPerPage = payload;
    },
    setCurrentPage: (state, { payload }: { payload: number }): void => {
      state.currentPage = payload;
    },
    setIsGenerating: (state, { payload }: { payload: boolean }): void => {
      state.isGenerating = payload;
    },
    setIsExporting: (state, { payload }: { payload: boolean }): void => {
      state.isExporting = payload;
    },
    setPreviewImages: (state, { payload }: { payload: boolean }): void => {
      state.previewImages = payload;
    },
    setDownloadImages: (state, { payload }: { payload: boolean }): void => {
      state.downloadImages = payload;
    },
    setName: (state, { payload }: { payload: string }): void => {
      state.name = payload;
    },
    setStatusText: (state, { payload }: { payload: string }): void => {
      state.statusText = payload;
    },
    resetExportSettings: (state): void => {
      state.downloadImages = false;
      state.previewImages = false;
      state.sortOverride = SortDirection.DESCENDING;
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
  setName,
  setStatusText,
  resetExportSettings,
  resetExportMaps,
  setExportUserMap,
  setExportAvatarMap,
  setExportEmojiMap,
  setExportMediaMap,
  setExportRoleMap,
} = exportSlice.actions;

const _downloadFilesFromMessage =
  ({ message, exportUtils, paths }: FilesFromMessagesProps): AppThunk =>
  async (dispatch, getState) => {
    const { downloadImages } = getState().export;
    let embeds = message.embeds;
    let attachments = message.attachments;
    if (!downloadImages) {
      embeds = [];
      attachments = attachments.filter(
        (attachment) => !entityContainsMedia(attachment)
      );
    }

    const { media: mediaPath } = paths;

    for (const entity of [...embeds, ...attachments]) {
      const isMedia = entityContainsMedia(entity);
      if (isMedia) {
        const downloadUrls = getMediaUrls(entity);
        for (const downloadUrl of downloadUrls) {
          const { discrubCancelled } = getState().app;
          if (discrubCancelled) break;
          await dispatch(checkDiscrubPaused());
          const { exportMaps } = getState().export;
          const map = exportMaps.mediaMap;

          if (!map[downloadUrl]) {
            const { success, data } = await downloadFile(downloadUrl);
            if (success && data) {
              const blobType = data.type.split("/")?.[1];
              const fileName = getExportFileName(entity, blobType);
              await exportUtils.addToZip(data, `${mediaPath}/${fileName}`);

              const updatedMediaMap = Object.assign(map, {
                [downloadUrl]: `${mediaPath.split("/")[1]}/${fileName}`,
              });
              dispatch(setExportMediaMap(updatedMediaMap));
            }
          }
        }
      }
    }
  };

const _downloadRoles =
  (exportUtils: ExportUtils): AppThunk =>
  async (dispatch, getState) => {
    const { selectedGuild } = getState().guild;
    if (selectedGuild) {
      const guildRoles = selectedGuild.roles || [];
      for (const role of guildRoles) {
        const { exportMaps } = getState().export;
        const iconUrl = getIconUrl(role);
        if (iconUrl) {
          const { success, data } = await downloadFile(iconUrl);
          if (success && data) {
            const fileExt = data.type.split("/")?.[1] || "webp";
            const fileName = getExportFileName(role, fileExt);
            const roleFilePath = `roles/${fileName}.${fileExt}`;
            await exportUtils.addToZip(data, roleFilePath);
            dispatch(
              setExportRoleMap(
                Object.assign(exportMaps.roleMap, {
                  [iconUrl]: `../${roleFilePath}`,
                })
              )
            );
          }
        }
      }
    }
  };

const _downloadAvatarFromMessage =
  ({ message, exportUtils }: AvatarFromMessageProps): AppThunk =>
  async (dispatch, getState) => {
    const { exportMaps } = getState().export;
    const { id: userId, avatar: avatarId } = message.author || {};
    const idAndAvatar = `${userId}/${avatarId}`;

    if (!exportMaps.avatarMap[idAndAvatar]) {
      const { success, data } = await downloadFile(
        getAvatarUrl(message.author)
      );
      if (success && data) {
        const fileExt = data.type.split("/")?.[1] || "webp";
        const avatarFilePath = `avatars/${idAndAvatar}.${fileExt}`;
        await exportUtils.addToZip(data, avatarFilePath);

        dispatch(
          setExportAvatarMap(
            Object.assign(exportMaps.avatarMap, {
              [idAndAvatar]: avatarFilePath,
            })
          )
        );
      }
    }
  };

/** MOVE TO CUSTOM HOOK
 *
 * @param {String} content String content to parse Discord special formatting
 * @returns An Object of special formatting
 */
export const getSpecialFormatting =
  (content: string): AppThunk<SpecialFormatting> =>
  (_, getState) => {
    const { userMap } = getState().export.exportMaps;
    const { selectedGuild } = getState().guild;
    const guildRoles = selectedGuild?.roles || [];

    return {
      userMention: Array.from(content.matchAll(MessageRegex.USER_MENTION))?.map(
        ({ 0: userMentionRef, groups: userMentionGroups }) => {
          const userId = userMentionGroups?.user_id || "";
          const foundRole = guildRoles.find((role) => role.id === userId);
          const { userName, displayName } = userMap[userId] || {};

          return {
            raw: userMentionRef,
            userName: foundRole?.name || displayName || userName || "Not Found",
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
      quote:
        content.match(MessageRegex.QUOTE)?.map((quoteRef) => ({
          text: quoteRef?.split("`")[1],
          raw: quoteRef,
        })) || [],
      hyperLink:
        content.match(MessageRegex.HYPER_LINK)?.map((hyperLinkRef) => ({
          raw: hyperLinkRef?.trim(),
        })) || [],
      emoji:
        content.match(MessageRegex.EMOJI)?.map((emojiRef) => ({
          raw: emojiRef,
          name: `:${emojiRef.split(":")[1]}:`,
          id: emojiRef.split(":")[2].replace(">", ""),
        })) || [],
    };
  };

const _getEmoji =
  ({ emojiRef, isReply, exportView }: GetEmojiProps): AppThunk<ReactElement> =>
  (_, getState) => {
    const { id, name } = emojiRef;
    const { emojiMap } = getState().export.exportMaps;
    let emojiUrl = `https://cdn.discordapp.com/emojis/${id}`;
    if (emojiMap && emojiMap[id] && exportView) {
      emojiUrl = `../${emojiMap[id]}`;
    }

    return (
      <ImgEmoji
        isReply={isReply}
        title={!isReply ? name : undefined}
        id={name}
        src={`${emojiUrl}`}
        alt={name}
      />
    );
  };

/**
 *
 * @param {String} content String content to get formatted html from
 * @returns Html in String format
 */
export const getFormattedInnerHtml =
  ({
    content,
    isReply = false,
    exportView = false,
  }: FormattedInnerHtmlProps): AppThunk<string> =>
  (dispatch, getState) => {
    const { userMap } = getState().export.exportMaps;
    const { selectedGuild } = getState().guild;
    let rawHtml = content || "";

    const { emoji } = dispatch(getSpecialFormatting(rawHtml));
    if (emoji.length) {
      emoji.forEach((emojiRef) => {
        rawHtml = rawHtml.replaceAll(
          emojiRef.raw,
          renderToString(dispatch(_getEmoji({ emojiRef, isReply, exportView })))
        );
      });
    }

    const { link } = dispatch(getSpecialFormatting(rawHtml));
    if (link.length) {
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
              rel="noreferrer"
              title={linkRef.description}
              dangerouslySetInnerHTML={{ __html: linkRef.text }}
            />
          )
        );
      });
    }

    const { hyperLink } = dispatch(getSpecialFormatting(rawHtml));
    if (hyperLink.length) {
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
              rel="noreferrer"
              title={hyperLinkRef.raw}
              dangerouslySetInnerHTML={{ __html: hyperLinkRef.raw }}
            />
          )
        );
      });
    }

    const { bold } = dispatch(getSpecialFormatting(rawHtml));
    if (bold.length) {
      bold.forEach((boldRef) => {
        rawHtml = rawHtml.replaceAll(
          boldRef.raw,
          renderToString(
            <strong dangerouslySetInnerHTML={{ __html: boldRef.text }} />
          )
        );
      });
    }

    const { code } = dispatch(getSpecialFormatting(rawHtml));
    if (code.length) {
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

    const { quote } = dispatch(getSpecialFormatting(rawHtml));
    if (quote.length) {
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

    const { underLine } = dispatch(getSpecialFormatting(rawHtml));
    if (underLine.length) {
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

    const { italics } = dispatch(getSpecialFormatting(rawHtml));
    if (italics.length) {
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

    const { channel } = dispatch(getSpecialFormatting(rawHtml));
    if (channel.length) {
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

    const { userMention } = dispatch(getSpecialFormatting(rawHtml));
    if (userMention.length) {
      userMention.forEach((userMentionRef) => {
        const { guilds, userName, displayName } = userMap[userMentionRef.id];

        let nick, roles, joinedAt: string | Maybe;
        let roleNames: string[] = [];
        if (selectedGuild) {
          ({ nick, roles, joinedAt } = guilds[selectedGuild.id]);
          roleNames = getRoleNames(roles, selectedGuild);
        }

        rawHtml = rawHtml.replaceAll(
          userMentionRef.raw,
          renderToString(
            <span
              title={formatUserData({
                userId: userMentionRef.id,
                userName,
                displayName,
                guildNickname: nick,
                joinedAt,
                roleNames,
              })}
              style={{
                backgroundColor: "#4a4b6f",
                padding: "0 2px",
                borderRadius: "5px",
              }}
              dangerouslySetInnerHTML={{
                __html: `@${nick || displayName || userName}`,
              }}
            />
          )
        );
      });
    }

    return rawHtml;
  };

const _downloadEmojisFromMessage =
  ({ message, exportUtils }: EmojisFromMessageProps): AppThunk =>
  async (dispatch, getState) => {
    const { emoji: emojiReferences } = dispatch(
      getSpecialFormatting(message.content)
    );
    if (emojiReferences.length) {
      for (const { id, name } of emojiReferences) {
        const { discrubCancelled } = getState().app;
        if (discrubCancelled) break;
        await dispatch(checkDiscrubPaused());

        const { success, data } = await downloadFile(
          `https://cdn.discordapp.com/emojis/${id}`
        );

        if (success && data) {
          const fileExt = data.type?.split("/")?.[1] || "gif";
          const emojiFilePath = `emojis/${getSafeExportName(
            name
          )}_${id}.${fileExt}`;
          await exportUtils.addToZip(data, emojiFilePath);
          const { exportMaps } = getState().export;
          dispatch(
            setExportEmojiMap({
              ...exportMaps.emojiMap,
              [id]: emojiFilePath,
            })
          );
        }
      }
    }
  };

const _processMessages =
  ({ messages, paths, exportUtils }: ProcessMessagesProps): AppThunk =>
  async (dispatch, getState) => {
    await dispatch(_downloadRoles(exportUtils));
    for (const [i, message] of messages.entries()) {
      await wait(!i ? 3 : 0);
      const { discrubCancelled } = getState().app;
      if (discrubCancelled) break;
      await dispatch(checkDiscrubPaused());

      await dispatch(
        _downloadFilesFromMessage({ message, exportUtils, paths })
      );
      await dispatch(_downloadEmojisFromMessage({ message, exportUtils }));
      await dispatch(_downloadAvatarFromMessage({ message, exportUtils }));

      if (i % 100 === 0) {
        const percent = getPercent(i, messages.length);
        dispatch(setStatusText(`Processing - ${percent}%`));
        await wait(0.1);
      }
    }
  };

const _exportHtml = async ({
  exportUtils,
  messages,
  entityMainDirectory,
  entityName,
  currentPage,
}: ExportHtmlProps) => {
  // TODO: Do we still need to reference messages in case of error?
  // HTML Exports actually are using ExportMessages component ref, NOT the messages passed to _exportHtml
  exportUtils.setExportMessages(messages); // This is purely so that we can reference the messages in the case of an error!
  const htmlBlob = await exportUtils.generateHTML();
  await exportUtils.addToZip(
    htmlBlob,
    `${entityMainDirectory}/${getSafeExportName(
      entityName
    )}_page_${currentPage}.html`
  );
};

const _exportJson =
  ({
    exportUtils,
    messages,
    entityMainDirectory,
    entityName,
    currentPage,
  }: ExportJsonProps): AppThunk =>
  async (dispatch, getState) => {
    const { userMap } = getState().export.exportMaps;

    await exportUtils.addToZip(
      new Blob(
        [
          JSON.stringify(
            messages.map((message) => {
              let { content } = message;
              // We are currently only parsing User mentions, using username, in JSON exports.
              const { userMention } = dispatch(getSpecialFormatting(content));
              if (userMention.length) {
                userMention.forEach((userMentionRef) => {
                  const { userName } = userMap[userMentionRef.id] || {};
                  content = content.replaceAll(
                    userMentionRef.raw,
                    `@${userName}`
                  );
                });
              }
              return Object.assign(new Message({ ...message }), { content });
            })
          ),
        ],
        {
          type: "text/plain",
        }
      ),
      `${entityMainDirectory}/${getSafeExportName(
        entityName
      )}_page_${currentPage}.json`
    );
  };

const _compressMessages =
  ({
    messages,
    format,
    entityName,
    entityMainDirectory,
    exportUtils,
  }: CompressMessagesProps): AppThunk =>
  async (dispatch, getState) => {
    // TODO: Combine the setStatusText and wait calls within exportSlice.
    dispatch(
      setStatusText(
        `Compressing${
          messages.length > 2000 ? " - This may take a while..." : ""
        }`
      )
    );
    await wait(5);

    const { messagesPerPage } = getState().export;

    const totalPages =
      messages.length > messagesPerPage
        ? Math.ceil(messages.length / messagesPerPage)
        : 1;
    while (getState().export.currentPage <= totalPages) {
      const currentPage = getState().export.currentPage;
      const { discrubCancelled } = getState().app;
      await dispatch(checkDiscrubPaused());
      if (discrubCancelled) break;
      dispatch(
        setStatusText(`Compressing - Page ${currentPage} of ${totalPages}`)
      );
      await wait(2);
      const startIndex =
        currentPage === 1 ? 0 : (currentPage - 1) * messagesPerPage;
      const exportMessages = messages?.slice(
        startIndex,
        startIndex + messagesPerPage
      );

      if (format === ExportType.JSON) {
        await dispatch(
          _exportJson({
            exportUtils,
            messages: exportMessages,
            entityMainDirectory,
            entityName,
            currentPage,
          })
        );
      } else if (format === ExportType.HTML) {
        await _exportHtml({
          exportUtils,
          messages: exportMessages,
          entityMainDirectory,
          entityName,
          currentPage,
        });
      }
      dispatch(setCurrentPage(currentPage + 1));
    }
    dispatch(setCurrentPage(1));
  };

export const exportMessages =
  ({
    selectedChannels,
    exportUtils,
    bulk = false,
    format = ExportType.JSON,
  }: ExportMessagesProps): AppThunk =>
  async (dispatch, getState) => {
    const { messages: contextMessages, filteredMessages } = getState().message;
    const { selectedGuild, preFilterUserId } = getState().guild;
    const { messagesPerPage, sortOverride } = getState().export;
    const { preFilterUserId: dmPreFilterUserId } = getState().dm;

    for (const entity of selectedChannels) {
      if (getState().app.discrubCancelled) break;
      dispatch(setStatusText(""));
      const safeEntityName = getSafeExportName(entity.name || entity.id);
      const entityMainDirectory = `${safeEntityName}_${uuidv4()}`;
      dispatch(setIsExporting(true));
      dispatch(setName(safeEntityName));
      if (bulk && !isDm(entity)) {
        dispatch(setChannel(entity.id));
      }

      let exportMessages: Message[] = [];
      if (bulk) {
        const messageData = await dispatch(
          getMessageData(
            selectedGuild?.id,
            entity.id,
            preFilterUserId || dmPreFilterUserId
          )
        );

        if (messageData) {
          exportMessages = messageData.messages
            .map((m) => new Message({ ...m }))
            .sort((a, b) =>
              sortByProperty(
                Object.assign(a, { date: new Date(a.timestamp) }),
                Object.assign(b, { date: new Date(b.timestamp) }),
                "date",
                sortOverride
              )
            );
        }
      } else {
        exportMessages = filteredMessages.length
          ? filteredMessages
          : contextMessages;
      }

      const mediaPath = `${entityMainDirectory}/${safeEntityName}_media`;
      const paths = { media: mediaPath };

      await dispatch(
        _processMessages({ messages: exportMessages, paths, exportUtils })
      );

      if (messagesPerPage === null || messagesPerPage === 0)
        await dispatch(setMessagesPerPage(exportMessages.length));

      if (exportMessages.length > 0) {
        if (getState().app.discrubCancelled) break;
        await dispatch(checkDiscrubPaused());
        await dispatch(
          _compressMessages({
            messages: exportMessages,
            format,
            entityName: safeEntityName,
            entityMainDirectory,
            exportUtils,
          })
        );
      }

      if (getState().app.discrubCancelled) break;
      await dispatch(checkDiscrubPaused());
    }
    await dispatch(checkDiscrubPaused());
    if (!getState().app.discrubCancelled) {
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
    dispatch(setStatusText(""));
    dispatch(setCurrentPage(1));
    dispatch(setDiscrubCancelled(false));
    dispatch(resetExportMaps(["emojiMap", "avatarMap", "mediaMap", "roleMap"]));
  };

export default exportSlice.reducer;
