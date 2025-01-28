import { isAttachment, isGuild, isNonNullable, isRole } from "./app/guards";
import Attachment from "./classes/attachment";
import Channel from "./classes/channel";
import Embed from "./classes/embed";
import { Emoji } from "./classes/emoji";
import Guild from "./classes/guild";
import Message from "./classes/message";
import Role from "./classes/role";
import { ChannelType } from "./enum/channel-type";
import { EmbedType } from "./enum/embed-type";
import { MessageRegex } from "./enum/message-regex";
import { v4 as uuidv4 } from "uuid";
import {
  ExportAvatarMap,
  ExportEmojiMap,
  ExportReaction,
  ExportRoleMap,
  ExportUserMap,
} from "./features/export/export-types";
import { ReactingUser } from "./components/reaction-list-item-button";
import { MessageType } from "./enum/message-type";
import { SearchCriteria } from "./features/message/message-types.ts";
import { addDays, addSeconds, isAfter, toDate } from "date-fns";
import { UserDataRefreshRate } from "./enum/user-data-refresh-rate.ts";
import { IsPinnedType } from "./enum/is-pinned-type.ts";

/**
 *
 * @param a Compare from
 * @param b Compare to
 * @param property Object property
 * @param direction Possible directions: 'desc' or 'asc'. (Default = 'asc')
 */
export const sortByProperty = <T>(
  a: T,
  b: T,
  property: string,
  direction = "asc",
) => {
  const aVal = a[property as keyof T];
  const bVal = b[property as keyof T];
  return aVal < bVal
    ? direction === "asc"
      ? -1
      : 1
    : aVal > bVal
      ? direction === "asc"
        ? 1
        : -1
      : 0;
};

/**
 *
 * @param seconds Number of seconds to wait for
 * @param callback Optional function to be used after the specified seconds have passed
 */
export const wait = async (seconds: number, callback = () => {}) => {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  return callback();
};

/**
 *
 * @param date Date object to retrieve timezone from
 * @returns Timezone as String
 */
export const getTimeZone = (date = new Date()) => {
  return date
    .toLocaleTimeString(undefined, { timeZoneName: "short" })
    .split(" ")[2];
};

/**
 *
 * @param index The index to check the percentage of
 * @param total The total number that to check the percentage from
 * @returns Percent value from `index` of `total`
 */
export const getPercent = (index: number, total: number): string => {
  if (index === 0 && total === 0) return "0";
  return ((index / total) * 100).toString().split(".")[0];
};

/**
 *
 * @param arr
 * @returns The joined strings properly punctuated
 */
export const punctuateStringArr = (arr: String[]) => {
  let str = "";
  arr.forEach((s) => {
    str = `${str}${
      str.length ? `${arr[arr.length - 1] === s ? " and " : ", "}` : ""
    }${s}`;
  });
  return str;
};

/**
 *
 * @param color Integer representation of hexadecimal color code
 * @returns Hexadecimal color code
 */
export const colorToHex = (color: number | Maybe): string => {
  if (!color) {
    return "#FFF";
  }

  return `#${color.toString(16)}`;
};

/**
 *
 * @param name The value to strip unsafe characters from
 * @returns OS safe version of `name`
 */
export const getSafeExportName = (name: string) => {
  const matchedWindowsCharacters =
    name.match(MessageRegex.WINDOWS_INVALID_CHARACTERS) || [];
  let retStr = name;
  matchedWindowsCharacters.forEach((char) => {
    retStr = retStr.replaceAll(char, "");
  });
  return retStr;
};

interface FormatUserData {
  userId?: string | Maybe;
  userName?: string | Maybe;
  displayName?: string | Maybe;
  guildNickname?: string | Maybe;
  joinedAt?: string | Maybe;
  roleNames?: string[];
}

/**
 *
 * @param userId
 * @param userName
 * @param displayName
 * @param guildNickName
 * @param joinedAt,
 * @param roleNames Array of Role names as Strings
 * @returns String formatted User data, to be used as HTML element title prop value
 */
export const formatUserData = ({
  userId,
  userName,
  displayName,
  guildNickname,
  joinedAt,
  roleNames = [],
}: FormatUserData) => {
  return `${userName ? `Username: ${userName}\n` : ""}${
    displayName ? `Display Name: ${displayName}\n` : ""
  }${guildNickname ? `Server Nickname: ${guildNickname}\n` : ""}${
    userId ? `User ID: ${userId}` : ""
  }${joinedAt ? `\nJoined Server: ${joinedAt}` : ""}${
    roleNames.length ? `\n\nRoles: ${roleNames.join(", ")}` : ""
  }`;
};

export const getRichEmbeds = (message: Message): Embed[] => {
  return message.embeds.filter((embed) => embed.type === EmbedType.RICH);
};

export const getExportFileName = (
  entity: Role | Attachment | Embed,
  type: string,
) => {
  if (isRole(entity)) {
    return `${getSafeExportName(entity.name)}_${entity.id}.${type}`;
  } else if (isAttachment(entity)) {
    return `${getSafeExportName(entity.filename)}.${uuidv4()}.${type}`;
  } else {
    const name = entity.title ? `${entity.title}_` : "";
    return `${getSafeExportName(name)}.${uuidv4()}.${type}`;
  }
};

export const getColor = (value: number): string => {
  return colorToHex(value);
};

export const getIconUrl = (entity: Channel | Guild) => {
  if (isGuild(entity)) {
    if (!entity.icon) {
      return "resources/media/default_group_chat_icon.png";
    }
    return `https://cdn.discordapp.com/icons/${entity.id}/${entity.icon}`;
  } else {
    if (entity.type === ChannelType.GROUP_DM) {
      return "resources/media/default_group_chat_icon.png";
    }

    if (entity.type === ChannelType.DM && entity.recipients?.[0]?.avatar) {
      return resolveAvatarUrl(
        entity.recipients[0].id,
        entity.recipients[0].avatar,
      ).remote;
    }

    return "resources/media/default_dm_icon.png";
  }
};

export const entityIsImage = (entity: Attachment | Embed) => {
  if (isAttachment(entity)) {
    return Boolean(
      entity.content_type?.includes("image") ||
        ["png", "jpg", "jpeg", "gif"].some((sit) =>
          entity.filename.includes(sit),
        ),
    );
  } else {
    return [EmbedType.IMAGE, EmbedType.RICH, EmbedType.ARTICLE].some(
      (type) => type === entity.type,
    );
  }
};

export const entityIsVideo = (entity: Attachment | Embed) => {
  if (isAttachment(entity)) {
    return Boolean(entity.content_type?.includes("video"));
  } else {
    return [EmbedType.GIFV, EmbedType.VIDEO].some(
      (type) => type === entity.type,
    );
  }
};

export const entityIsAudio = (entity: Attachment | Embed) => {
  if (isAttachment(entity)) {
    return Boolean(
      entity.content_type?.includes("audio") ||
        ["ogg"].some((sit) => entity.filename.includes(sit)),
    );
  }
  // TODO: Look into supporting embedded audio.
  return false;
};

export const entityContainsMedia = (entity: Attachment | Embed) => {
  return (
    entityIsImage(entity) || entityIsVideo(entity) || entityIsAudio(entity)
  );
};

export const getMediaUrls = (entity: Attachment | Embed): string[] => {
  let urls: (string | undefined)[] = [];

  if (isAttachment(entity)) {
    urls = [entity.proxy_url];
  } else {
    switch (entity.type) {
      case EmbedType.GIFV:
        urls = [entity.video?.proxy_url];
        break;
      case EmbedType.IMAGE:
        urls = [entity.thumbnail?.proxy_url];
        break;
      case EmbedType.RICH:
        urls = [
          entity.author?.proxy_icon_url,
          entity.image?.proxy_url,
          entity.thumbnail?.proxy_url,
          entity.footer?.proxy_icon_url,
        ];
        break;
      case EmbedType.ARTICLE:
        urls = [entity.thumbnail?.proxy_url];
        break;
      case EmbedType.VIDEO:
        urls = [entity.video?.proxy_url];
        break;
      default:
        break;
    }
  }
  return urls.filter(isNonNullable);
};

export const isDm = (channel: Channel) => {
  return [ChannelType.DM, ChannelType.GROUP_DM].some(
    (type) => type === channel.type,
  );
};

type HighestRole = {
  colorRole: Role | Maybe;
  iconRole: Role | Maybe;
};

/**
 *
 * @param {Array} roleIds Array of String roleIds
 * @returns An object containing Role entities for the highest position color and icon
 */
export const getHighestRoles = (
  roleIds: string[] = [],
  guild: Guild,
): HighestRole | Maybe => {
  if (!guild.roles || !roleIds) {
    return null;
  }

  const applicableRoles = _getApplicableRoles(roleIds, guild);

  const colorRole =
    _orderRoles(applicableRoles.filter((role) => Boolean(role.color)))?.[0] ||
    null;

  const iconRole =
    _orderRoles(
      applicableRoles.filter(
        (role) => !!resolveRoleUrl(role.id, role.icon).remote,
      ),
    )?.[0] || null;

  return { colorRole, iconRole };
};

export const getRoleNames = (
  roleIds: string[] = [],
  guild: Guild,
): string[] => {
  const applicableRoles = _getApplicableRoles(roleIds, guild);

  return _orderRoles(applicableRoles).map((role) => role.name);
};

/**
 *
 * @param {Array} roles Array of Roles to be ordered
 * @returns An ordered array of Roles, descending by position
 */
const _orderRoles = (roles: Role[] = []): Role[] => {
  return roles
    .map((role) => new Role({ ...role }))
    .sort((a, b) => sortByProperty(a, b, "position", "desc"));
};

const _getApplicableRoles = (roleIds: string[] = [], guild: Guild): Role[] => {
  return (
    guild.roles?.filter(
      (role) => roleIds.some((id) => id === role.id) && Boolean(role.position),
    ) || []
  );
};

export const getEncodedEmoji = (emoji: Emoji): string | null => {
  const { name, id } = emoji;
  const emojiString = id ? `${name}:${id}` : name;
  return emojiString || null;
};

export const isGuildForum = (channel: Channel | Maybe) => {
  return !!(
    channel &&
    [ChannelType.GUILD_FORUM, ChannelType.GUILD_MEDIA].some(
      (type) => type === channel.type,
    )
  );
};

export type ResolvedFilePathObject = {
  local: string | undefined;
  remote: string | undefined;
};

export const resolveRoleUrl = (
  roleId: Snowflake,
  roleIcon: string | Maybe,
  roleMap?: ExportRoleMap | Maybe,
): ResolvedFilePathObject => {
  const remoteFilePath =
    roleId && roleIcon
      ? `https://cdn.discordapp.com/role-icons/${roleId}/${roleIcon}`
      : undefined;

  let localFilePath = remoteFilePath
    ? roleMap?.[remoteFilePath] || undefined
    : undefined;

  if (localFilePath) {
    localFilePath = `../${localFilePath}`;
  }

  return {
    remote: remoteFilePath,
    local: localFilePath,
  };
};

export const resolveEmojiUrl = (
  emojiId: Snowflake | Maybe,
  emojiMap?: ExportEmojiMap | Maybe,
): ResolvedFilePathObject => {
  let localFilePath = emojiId ? emojiMap?.[emojiId] || undefined : undefined;
  if (localFilePath) {
    localFilePath = `../${localFilePath}`;
  }

  return {
    remote: `https://cdn.discordapp.com/emojis/${emojiId}`,
    local: localFilePath,
  };
};

export const resolveAvatarUrl = (
  userId: Snowflake,
  avatar: string | Maybe,
  avatarMap?: ExportAvatarMap,
): ResolvedFilePathObject => {
  const idAndAvatar = `${userId}/${avatar}`;
  let localFilePath = avatarMap?.[idAndAvatar] || undefined;
  if (localFilePath) {
    localFilePath = `../${localFilePath}`;
  }

  return {
    remote: avatar
      ? `https://cdn.discordapp.com/avatars/${idAndAvatar}`
      : "resources/media/default_avatar.png",
    local: localFilePath,
  };
};

export const stringToBool = (str: string): boolean =>
  str.toLowerCase() === "true";

export const boolToString = (b: boolean): string =>
  b === true ? "true" : "false";

export const stringToTypedArray = <T>(str: string): T[] => {
  return str ? str.split(",").map((s) => s as T) : [];
};

export const getReactingUsers = (
  exportReactions: ExportReaction[],
  userMap: ExportUserMap,
  selectedGuild: Guild | Maybe,
): ReactingUser[] => {
  return exportReactions
    .filter(({ id: userId }) => userMap[userId])
    .map(({ id: userId, burst }) => {
      const mapping = userMap[userId];
      const guildNickName = selectedGuild
        ? mapping?.guilds?.[selectedGuild.id]?.nick
        : null;

      return {
        displayName: guildNickName || mapping.displayName,
        userName: mapping.userName,
        id: userId,
        avatar: mapping.avatar,
        burst,
      };
    });
};

export const isThreadMessage = (message?: Message, threads: Channel[] = []) => {
  return !!message?.thread || threads.some((t) => t.id === message?.channel_id);
};

export const isNonStandardMessage = (message: Message) => {
  const nonStandardTypes = [
    MessageType.CALL,
    MessageType.CHANNEL_PINNED_MESSAGE,
  ];
  return nonStandardTypes.some((v) => messageTypeEquals(message.type, v));
};

export const messageTypeEquals = (type: number, compareType: MessageType) => {
  return `${type}` === compareType;
};

export const isRemovableMessage = (message: Message): boolean => {
  return ![
    MessageType.RECIPIENT_ADD,
    MessageType.RECIPIENT_REMOVE,
    MessageType.CALL,
    MessageType.CHANNEL_NAME_CHANGE,
    MessageType.CHANNEL_ICON_CHANGE,
    MessageType.THREAD_STARTER_MESSAGE,
  ].some((t) => messageTypeEquals(message.type, t));
};

export const isCriteriaActive = (searchCritera: SearchCriteria) => {
  const {
    searchBeforeDate,
    searchAfterDate,
    searchMessageContent,
    selectedHasTypes,
    userIds,
    isPinned,
    mentionIds,
  } = searchCritera;
  return [
    searchBeforeDate,
    searchAfterDate,
    searchMessageContent,
    selectedHasTypes.length,
    userIds.length,
    isPinned !== IsPinnedType.UNSET,
    mentionIds.length,
  ].some((c) => c);
};

export const isUserDataStale = (
  timestamp: number = new Date().getTime(),
  appUserDataRefreshRate: string,
) => {
  if (appUserDataRefreshRate === UserDataRefreshRate.ALWAYS) {
    return true;
  }

  const today = new Date();
  let staleDate = toDate(timestamp);

  switch (appUserDataRefreshRate) {
    case UserDataRefreshRate.HOURLY:
      staleDate = addSeconds(staleDate, 3600);
      break;
    case UserDataRefreshRate.DAILY: {
      staleDate = addDays(staleDate, 1);
      break;
    }
    case UserDataRefreshRate.WEEKLY: {
      staleDate = addDays(staleDate, 7);
      break;
    }
    case UserDataRefreshRate.MONTHLY: {
      staleDate = addDays(staleDate, 30);
      break;
    }
    case UserDataRefreshRate.NEVER: {
      staleDate = addDays(staleDate, 5000);
      break;
    }
    default:
      break;
  }

  return isAfter(today, staleDate);
};

/**
 * Sort and return the provided Channel array by name.
 * @param channels
 */
export const getSortedChannels = (channels: Channel[]) => {
  return channels
    .map((c) => new Channel({ ...c }))
    .sort((a, b) =>
      sortByProperty(
        { name: String(a.name).toLowerCase() },
        { name: String(b.name).toLowerCase() },
        "name",
      ),
    );
};

/**
 * Sort and return the provided Guild array by name.
 * @param guilds
 */
export const getSortedGuilds = (guilds: Guild[]) => {
  return guilds
    .map((g) => new Guild({ ...g }))
    .sort((a, b) =>
      sortByProperty(
        { name: a.name.toLowerCase() },
        { name: b.name.toLowerCase() },
        "name",
      ),
    );
};