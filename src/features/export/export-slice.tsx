import { createSlice } from "@reduxjs/toolkit";
import { getMessageData, resetMessageData } from "../message/message-slice";
import { v4 as uuidv4 } from "uuid";
import {
  entityContainsMedia,
  formatUserData,
  getAvatarUrl,
  getEncodedEmoji,
  getExportFileName,
  getIconUrl,
  getMediaUrls,
  getRoleNames,
  getSafeExportName,
  isDm,
  resolveEmojiUrl,
  sortByProperty,
  stringToBool,
  wait,
} from "../../utils";
import { resetChannel, setChannel } from "../channel/channel-slice";
import {
  checkDiscrubPaused,
  resetStatus,
  setDiscrubCancelled,
  setStatus,
} from "../app/app-slice";
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
  ExportReactionMap,
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
import Guild from "../../classes/guild";
import Papa from "papaparse";
import { flatten } from "flat";
import Channel from "../../classes/channel";

const initialMaps: ExportMap = {
  userMap: {},
  emojiMap: {},
  avatarMap: {},
  mediaMap: {},
  roleMap: {},
  reactionMap: {},
};

const initialState: ExportState = {
  isExporting: false,
  downloadImages: false,
  previewImages: false,
  artistMode: false,
  name: "",
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
    setExportReactionMap: (
      state,
      { payload }: { payload: ExportReactionMap }
    ): void => {
      state.exportMaps.reactionMap = payload;
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
            case "reactionMap":
              state.exportMaps.reactionMap = initialMaps.reactionMap;
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
    setArtistMode: (state, { payload }: { payload: boolean }): void => {
      state.artistMode = payload;
    },
    setName: (state, { payload }: { payload: string }): void => {
      state.name = payload;
    },
    resetExportSettings: (state): void => {
      state.downloadImages = false;
      state.previewImages = false;
      state.artistMode = false;
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
  resetExportSettings,
  resetExportMaps,
  setExportUserMap,
  setExportAvatarMap,
  setExportEmojiMap,
  setExportMediaMap,
  setExportRoleMap,
  setExportReactionMap,
  setArtistMode,
} = exportSlice.actions;

const _downloadFilesFromMessage =
  ({
    message,
    exportUtils,
    paths,
    index,
  }: FilesFromMessagesProps): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { downloadImages, artistMode } = getState().export;
    let embeds = message.embeds;
    let attachments = message.attachments;
    if (!downloadImages) {
      embeds = [];
      attachments = attachments.filter(
        (attachment) => !entityContainsMedia(attachment)
      );
    }

    let mediaPath = paths.media;
    if (artistMode && message.userName) {
      mediaPath = `${mediaPath}/${message.userName}`;
    }

    for (const [eI, entity] of [...embeds, ...attachments].entries()) {
      const isMedia = entityContainsMedia(entity);
      if (isMedia) {
        const downloadUrls = getMediaUrls(entity);
        for (const [dI, downloadUrl] of downloadUrls.entries()) {
          const { discrubCancelled } = getState().app;
          if (discrubCancelled) break;
          await dispatch(checkDiscrubPaused());
          const { exportMaps } = getState().export;
          const map = exportMaps.mediaMap;

          if (!map[downloadUrl]) {
            const { success, data } = await downloadFile(downloadUrl);
            if (success && data) {
              const blobType = data.type.split("/")?.[1];
              const fileIndex = `${index + 1}_${eI + 1}_${dI + 1}`;
              const fileName = `${fileIndex}_${getExportFileName(
                entity,
                blobType
              )}`;
              await exportUtils.addToZip(data, `${mediaPath}/${fileName}`);

              const sliceIdx = mediaPath.indexOf("/");

              const updatedMediaMap = {
                ...map,
                [downloadUrl]: `${mediaPath.slice(sliceIdx + 1)}/${fileName}`,
              };
              dispatch(setExportMediaMap(updatedMediaMap));
            }
          }
        }
      }
    }
  };

const _downloadRoles =
  (exportUtils: ExportUtils, guild: Guild): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const guildRoles = guild.roles || [];
    for (const [_, role] of guildRoles.entries()) {
      const { discrubCancelled } = getState().app;
      if (discrubCancelled) break;
      await dispatch(checkDiscrubPaused());

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
            setExportRoleMap({
              ...exportMaps.roleMap,
              [iconUrl]: `../${roleFilePath}`,
            })
          );
        }
      }
    }
  };

const _downloadAvatarFromMessage =
  ({ message, exportUtils }: AvatarFromMessageProps): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { settings } = getState().app;
    const { reactionsEnabled } = settings;
    const { exportMaps } = getState().export;
    const { reactionMap, userMap } = exportMaps;

    const avatarLookups: { id: Snowflake; avatar: string | Maybe }[] = [
      { id: message.author.id, avatar: message.author.avatar },
    ];

    if (stringToBool(reactionsEnabled)) {
      message.reactions?.forEach((r) => {
        const encodedEmoji = getEncodedEmoji(r.emoji);
        if (encodedEmoji) {
          const users = reactionMap[message.id]?.[encodedEmoji] || [];
          users.forEach((eR) => {
            const { avatar } = userMap[eR.id] || {};
            if (!avatarLookups.some((aL) => aL.id === eR.id))
              avatarLookups.push({ id: eR.id, avatar: avatar });
          });
        }
      });
    }

    for (const [_, aL] of avatarLookups.entries()) {
      const { discrubCancelled } = getState().app;
      if (discrubCancelled) break;
      await dispatch(checkDiscrubPaused());

      const { avatarMap } = getState().export.exportMaps;
      const idAndAvatar = `${aL.id}/${aL.avatar}`;

      if (!avatarMap[idAndAvatar]) {
        const { success, data } = await downloadFile(
          getAvatarUrl(aL.id, aL.avatar)
        );
        if (success && data) {
          const fileExt = data.type.split("/")?.[1] || "webp";
          const avatarFilePath = `avatars/${idAndAvatar}.${fileExt}`;
          await exportUtils.addToZip(data, avatarFilePath);

          dispatch(
            setExportAvatarMap({
              ...avatarMap,
              [idAndAvatar]: avatarFilePath,
            })
          );
        }
      }
    }
  };

/**
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

    const { local: localPath, remote: remotePath } = resolveEmojiUrl(
      emojiMap,
      id
    );

    const emojiUrl = exportView && localPath ? localPath : remotePath;

    return (
      <img
        style={{
          display: "inline-flex",
          verticalAlign: "middle",
          width: isReply ? "16px" : "25px",
          height: isReply ? "16px" : "25px",
        }}
        title={isReply ? undefined : name}
        id={name}
        src={emojiUrl}
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
                backgroundColor: "#282b30",
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
        const userMapping = userMap[userMentionRef.id];
        const { guilds, userName, displayName } = userMapping || {
          guilds: {},
          userName: null,
          displayName: null,
        };

        let nick, roles, joinedAt: string | Maybe;
        let roleNames: string[] = [];
        if (selectedGuild) {
          ({ nick, roles, joinedAt } = guilds[selectedGuild.id] || {});
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
                __html: `@${nick || displayName || userName || "Deleted User"}`,
              }}
            />
          )
        );
      });
    }

    return rawHtml;
  };

const _downloadEmojisFromMessage =
  ({ message, exportUtils }: EmojisFromMessageProps): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { emoji: emojiReferences } = dispatch(
      getSpecialFormatting(message.content)
    );
    const { settings } = getState().app;
    const reactionsEnabled = stringToBool(settings.reactionsEnabled);
    if (message.reactions && reactionsEnabled) {
      message.reactions.forEach((r) => {
        const { id, name } = r.emoji || {};
        if (id && name) emojiReferences.push({ id, name, raw: "" });
      });
    }

    if (emojiReferences.length) {
      for (const { id, name } of emojiReferences) {
        const { discrubCancelled } = getState().app;
        if (discrubCancelled) break;
        await dispatch(checkDiscrubPaused());
        const { exportMaps } = getState().export;
        if (!exportMaps.emojiMap[id]) {
          const { success, data } = await downloadFile(
            `https://cdn.discordapp.com/emojis/${id}`
          );

          if (success && data) {
            const fileExt = data.type?.split("/")?.[1] || "gif";
            const emojiFilePath = `emojis/${getSafeExportName(
              name
            )}_${id}.${fileExt}`;
            await exportUtils.addToZip(data, emojiFilePath);

            dispatch(
              setExportEmojiMap({
                ...exportMaps.emojiMap,
                [id]: emojiFilePath,
              })
            );
          }
        }
      }
    }
  };

const _downloadDiscrubMedia = async (exportUtils: ExportUtils) => {
  const media = [{ url: "resources/media/discrub.png", name: "discrub.png" }];
  for (const m of media) {
    const { success, data } = await downloadFile(m.url);

    if (success && data) {
      await exportUtils.addToZip(data, `discrub_media/${m.name}`);
    }
  }
};

const _processMessages =
  ({
    messages,
    paths,
    exportUtils,
  }: ProcessMessagesProps): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    for (const [i, message] of messages.entries()) {
      await wait(!i ? 3 : 0);
      const { discrubCancelled } = getState().app;
      if (discrubCancelled) break;
      await dispatch(checkDiscrubPaused());

      await dispatch(
        _downloadFilesFromMessage({ message, exportUtils, paths, index: i })
      );
      await dispatch(_downloadEmojisFromMessage({ message, exportUtils }));
      await dispatch(_downloadAvatarFromMessage({ message, exportUtils }));

      if (i % 10 === 0) {
        const status = `Processing - Message ${i} of ${messages.length}`;
        dispatch(setStatus(status));
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
  }: ExportJsonProps): AppThunk<Promise<void>> =>
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

const _exportCsv = async ({
  exportUtils,
  messages,
  entityMainDirectory,
  entityName,
  currentPage,
}: ExportHtmlProps) => {
  const csvData: unknown[] = messages.map((m) => flatten(m));

  await exportUtils.addToZip(
    Papa.unparse(csvData),
    `${entityMainDirectory}/${getSafeExportName(
      entityName
    )}_page_${currentPage}.csv`
  );
};

const _compressMessages =
  ({
    messages,
    format,
    entityName,
    entityMainDirectory,
    exportUtils,
  }: CompressMessagesProps): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(setStatus("Compressing"));
    await wait(1);

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
      if (format === ExportType.MEDIA) {
        dispatch(setStatus("Cleaning up..."));
      } else {
        const status = `Compressing - Page ${currentPage} of ${totalPages}`;
        dispatch(setStatus(status));
      }

      await wait(1);
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
      } else if (format === ExportType.CSV) {
        await _exportCsv({
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
  (
    messages: Message[],
    entityName: string,
    exportUtils: ExportUtils,
    format: ExportType
  ): AppThunk =>
  async (dispatch, getState) => {
    const { selectedGuild } = getState().guild;
    const { messagesPerPage } = getState().export;

    const safeEntityName = getSafeExportName(entityName);
    const entityMainDirectory = `${safeEntityName}_${uuidv4()}`;
    dispatch(setIsExporting(true));
    dispatch(setName(safeEntityName));

    if (selectedGuild)
      await dispatch(_downloadRoles(exportUtils, selectedGuild));
    if (format === ExportType.HTML) await _downloadDiscrubMedia(exportUtils);

    const mediaPath = `${entityMainDirectory}/${safeEntityName}_media`;
    const paths = { media: mediaPath };

    await dispatch(_processMessages({ messages, paths, exportUtils }));

    if (messagesPerPage === null || messagesPerPage === 0)
      await dispatch(setMessagesPerPage(exportMessages.length));

    if (messages.length > 0 && !getState().app.discrubCancelled) {
      await dispatch(checkDiscrubPaused());
      await dispatch(
        _compressMessages({
          messages,
          format,
          entityName: safeEntityName,
          entityMainDirectory,
          exportUtils,
        })
      );
    }

    await dispatch(checkDiscrubPaused());
    if (!getState().app.discrubCancelled) {
      dispatch(setStatus("Preparing Archive"));
      await exportUtils.generateZip();
    }

    dispatch(setIsGenerating(false));
    dispatch(setIsExporting(false));
    dispatch(setName(""));
    await exportUtils.resetZip();
    dispatch(resetStatus());
    dispatch(setCurrentPage(1));
    dispatch(setDiscrubCancelled(false));
    dispatch(resetExportMaps(["emojiMap", "avatarMap", "mediaMap", "roleMap"]));
  };

export const exportChannels =
  (
    channels: Channel[],
    exportUtils: ExportUtils,
    format: ExportType,
    userId?: Snowflake
  ): AppThunk =>
  async (dispatch, getState) => {
    const { selectedGuild } = getState().guild;
    const { messagesPerPage, sortOverride } = getState().export;

    dispatch(setIsExporting(true));

    if (selectedGuild)
      await dispatch(_downloadRoles(exportUtils, selectedGuild));
    if (format === ExportType.HTML) await _downloadDiscrubMedia(exportUtils);

    for (const entity of channels) {
      if (getState().app.discrubCancelled) break;
      dispatch(resetStatus());
      const safeEntityName = getSafeExportName(entity.name || entity.id);
      const entityMainDirectory = `${safeEntityName}_${uuidv4()}`;
      dispatch(setName(safeEntityName));
      if (!isDm(entity)) {
        dispatch(setChannel(entity.id));
      }

      let exportMessages: Message[] = [];

      const messageData = await dispatch(
        getMessageData(selectedGuild?.id, entity.id, {
          preFilterUserId: userId,
        })
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
      dispatch(setStatus("Preparing Archive"));
      await exportUtils.generateZip();
    }

    dispatch(resetChannel());
    dispatch(resetMessageData());

    dispatch(setIsGenerating(false));
    dispatch(setIsExporting(false));
    dispatch(setName(""));
    await exportUtils.resetZip();
    dispatch(resetStatus());
    dispatch(setCurrentPage(1));
    dispatch(setDiscrubCancelled(false));
    dispatch(resetExportMaps(["emojiMap", "avatarMap", "mediaMap", "roleMap"]));
  };

export default exportSlice.reducer;
