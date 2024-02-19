import { isAttachment, isGuild, isRole } from "./app/guards";
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
  direction = "asc"
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
  return `${userName ? `Username: ${userName}` : ""}${
    displayName ? `\nGlobal Name: ${displayName}` : ""
  }${guildNickname ? `\nNickname: ${guildNickname}` : ""}${
    userId ? `\nUser ID: ${userId}` : ""
  }${joinedAt ? `\nJoined Server: ${joinedAt}` : ""}${
    roleNames.length ? `\n\nRoles: ${roleNames.join(", ")}` : ""
  }`;
};

export const getAvatarUrl = (userId: Snowflake, avatar?: string | Maybe) => {
  if (avatar) {
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}`;
  } else {
    return "resources/media/default_avatar.png";
  }
};

export const getRichEmbeds = (message: Message): Embed[] => {
  return message.embeds.filter((embed) => embed.type === EmbedType.RICH);
};

export const getExportFileName = (
  entity: Role | Attachment | Embed,
  type: string
) => {
  if (isRole(entity)) {
    return `${getSafeExportName(entity.name)}_${entity.id}.${type}`;
  } else if (isAttachment(entity)) {
    return `${getSafeExportName(entity.filename)}_${uuidv4()}.${type}`;
  } else {
    const name = entity.title ? `${entity.title}_` : "";
    return `${getSafeExportName(name)}${uuidv4()}.${type}`;
  }
};

export const getColor = (value: number): string => {
  return colorToHex(value);
};

export const getIconUrl = (entity: Role | Channel | Guild) => {
  if (isRole(entity)) {
    if (!entity.id || !entity.icon) return "";
    return `https://cdn.discordapp.com/role-icons/${entity.id}/${entity.icon}`;
  } else if (isGuild(entity)) {
    if (!entity.icon) {
      return "resources/media/default_group_chat_icon.png";
    }
    return `https://cdn.discordapp.com/icons/${entity.id}/${entity.icon}`;
  } else {
    if (entity.type === ChannelType.GROUP_DM) {
      return "resources/media/default_group_chat_icon.png";
    }

    if (entity.type === ChannelType.DM && entity.recipients?.[0]?.avatar) {
      return getAvatarUrl(entity.recipients[0].id, entity.recipients[0].avatar);
    }

    return "resources/media/default_dm_icon.png";
  }
};

export const attachmentIsVideo = (attachment: Attachment): boolean => {
  return Boolean(attachment.content_type?.includes("video"));
};

export const attachmentIsImage = (attachment: Attachment): boolean => {
  return Boolean(
    attachment.content_type?.includes("image") ||
      ["png", "jpg", "jpeg", "gif"].some((sit) =>
        attachment.filename.includes(sit)
      )
  );
};

export const attachmentIsAudio = (attachment: Attachment): boolean => {
  return Boolean(
    attachment.content_type?.includes("audio") ||
      ["ogg"].some((sit) => attachment.filename.includes(sit))
  );
};

export const entityContainsMedia = (entity: Attachment | Embed) => {
  if (isAttachment(entity)) {
    return (
      attachmentIsVideo(entity) ||
      attachmentIsImage(entity) ||
      attachmentIsAudio(entity)
    );
  } else {
    return [EmbedType.GIFV, EmbedType.IMAGE, EmbedType.RICH].some(
      (type) => type === entity.type
    );
  }
};

export const getMediaUrls = (entity: Attachment | Embed) => {
  if (isAttachment(entity)) {
    return [entity.proxy_url].filter(Boolean);
  } else {
    if (entity.type === EmbedType.GIFV) {
      const url = entity.video?.proxy_url;
      if (url) return [url];
    }
    if (entity.type === EmbedType.IMAGE) {
      const url = entity.thumbnail?.proxy_url;
      if (url) return [url];
    }
    if (entity.type === EmbedType.RICH) {
      const retArr: string[] = [];
      [
        entity.author?.proxy_icon_url,
        entity.image?.proxy_url,
        entity.thumbnail?.proxy_url,
        entity.footer?.proxy_icon_url,
      ].forEach((url) => {
        if (url) retArr.push(url);
      });
      return retArr;
    }
    return [];
  }
};

export const isDm = (channel: Channel) => {
  return [ChannelType.DM, ChannelType.GROUP_DM].some(
    (type) => type === channel.type
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
  guild: Guild
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
      applicableRoles.filter((role) => Boolean(getIconUrl(role)))
    )?.[0] || null;

  return { colorRole, iconRole };
};

export const getRoleNames = (
  roleIds: string[] = [],
  guild: Guild
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
      (role) => roleIds.some((id) => id === role.id) && Boolean(role.position)
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
      (type) => type === channel.type
    )
  );
};
