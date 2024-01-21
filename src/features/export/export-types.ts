import Channel from "../../classes/channel";
import Message from "../../classes/message";
import { ExportType } from "../../enum/export-type";
import { SortDirection } from "../../enum/sort-direction";
import ExportUtils from "./export-utils";

export type ExportState = {
  isExporting: boolean;
  downloadImages: boolean;
  previewImages: boolean;
  name: string;
  statusText: string;
  isGenerating: boolean;
  currentPage: number;
  messagesPerPage: number;
  sortOverride: SortDirection;
  exportMaps: ExportMap;
};

export type ExportMap = {
  userMap: ExportUserMap;
  emojiMap: ExportEmojiMap;
  avatarMap: ExportAvatarMap;
  mediaMap: ExportMediaMap;
  roleMap: ExportRoleMap;
};

/**
 * This is a 'User Id -> User Information' map.
 */
export type ExportUserMap = {
  [id: Snowflake]: {
    userName: string | Maybe;
    displayName: string | Maybe;
    guilds: {
      [guildId: Snowflake]: {
        roles: Snowflake[];
        nick: string | Maybe;
        joinedAt: string | Maybe;
      };
    };
  };
};

/**
 * This is an 'Emoji Id -> Local File Path' map.
 */
export type ExportEmojiMap = {
  [id: Snowflake]: string;
};

/**
 * This is an 'User Id and Avatar -> Local File Path' map.
 * @example idAndAvatar = "1234567/s3oma03mdsm" where "1234567" is a User Id and "s3oma03mdsm" is an Avatar
 */
export type ExportAvatarMap = {
  [idAndAvatar: string]: string;
};

/**
 * This is a 'Remote URL -> Local File Path' map.
 */
export type ExportMediaMap = {
  [remoteUrl: string]: string;
};

/**
 * This is a 'Remote URL -> Local File Path' map.
 */
export type ExportRoleMap = {
  [remoteUrl: string]: string;
};

export type SpecialFormatting = {
  userMention: UserMentionRef[];
  channel: ChannelRef[];
  underLine: UnderlineRef[];
  code: CodeRef[];
  italics: ItalicRef[];
  bold: BoldRef[];
  link: LinkRef[];
  quote: QuoteRef[];
  hyperLink: HyperlinkRef[];
  emoji: EmojiRef[];
};

export type UserMentionRef = { raw: string; userName: string; id: Snowflake };
export type ChannelRef = { channelId: Snowflake | Maybe; raw: string };
export type UnderlineRef = { text: string; raw: string };
export type CodeRef = { text: string; raw: string };
export type ItalicRef = { text: string; raw: string };
export type BoldRef = { text: string; raw: string };
export type LinkRef = {
  url: string;
  text: string;
  description: string;
  raw: string;
};
export type QuoteRef = { text: string; raw: string };
export type HyperlinkRef = { raw: string };
export type EmojiRef = { raw: string; name: string; id: Snowflake };

export type FilesFromMessagesProps = {
  message: Message;
  exportUtils: ExportUtils;
  paths: { media: string };
};

export type AvatarFromMessageProps = {
  message: Message;
  exportUtils: ExportUtils;
};

export type GetEmojiProps = {
  emojiRef: EmojiRef;
  isReply: boolean;
  exportView: boolean;
};

export type FormattedInnerHtmlProps = {
  content: string;
  isReply: boolean;
  exportView: boolean;
};

export type EmojisFromMessageProps = {
  message: Message;
  exportUtils: ExportUtils;
};

export type ProcessMessagesProps = {
  messages: Message[];
  paths: { media: string };
  exportUtils: ExportUtils;
};

export type ExportHtmlProps = {
  exportUtils: ExportUtils;
  messages: Message[];
  entityMainDirectory: string;
  entityName: string;
  currentPage: number;
};

export type ExportJsonProps = ExportHtmlProps;

export type CompressMessagesProps = {
  messages: Message[];
  format: ExportType;
  entityName: string;
  entityMainDirectory: string;
  exportUtils: ExportUtils;
};

export type ExportMessagesProps = {
  selectedChannels: Channel[];
  exportUtils: ExportUtils;
  bulk: boolean;
  format: ExportType;
};
