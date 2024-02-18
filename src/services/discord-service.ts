import Attachment from "../classes/attachment";
import Channel from "../classes/channel";
import Embed from "../classes/embed";
import Guild from "../classes/guild";
import Message from "../classes/message";
import Role from "../classes/role";
import { User } from "../classes/user";
import { QueryStringParam } from "../enum/query-string-param";
import { ReactionType } from "../enum/reaction-type";
import { SearchMessageProps } from "../features/message/message-types";
import { AllowedMentionObject } from "../types/allowed-mention-object";
import { ComponentObject } from "../types/component-object";
import { DefaultReactionObject } from "../types/default-reaction-object";
import { ForumTagObject } from "../types/forum-tag-object";
import { GuildMemberObject } from "../types/guild-member-object";
import { OverwriteObject } from "../types/overwrite-object";
import { wait } from "../utils";

const DISCORD_API_URL = "https://discord.com/api/v10";
const DISCORD_USERS_ENDPOINT = `${DISCORD_API_URL}/users`;
const DISCORD_GUILDS_ENDPOINT = `${DISCORD_API_URL}/guilds`;
const DISCORD_CHANNELS_ENDPOINT = `${DISCORD_API_URL}/channels`;
const userAgent =
  "Mozilla/5.0 (X11; Linux x86_64; rv:17.0) Gecko/20121202 Firefox/17.0 Iceweasel/17.0.1";

const generateSnowflake = (date: Date = new Date()): string =>
  ((BigInt(date.valueOf()) - BigInt(1420070400000)) << BigInt(22)).toString();

const withRetry = async <T = void>(
  promise: () => Promise<Response>,
  isBlob: boolean = false
): Promise<DiscordApiResponse<T>> => {
  let apiResponse: DiscordApiResponse<T> = { success: false };
  try {
    let requestComplete = false;
    while (!requestComplete) {
      const response = await promise();
      const { status, ok } = response;
      if (ok) {
        // Request was successful
        requestComplete = true;
        if (status === 200) {
          // Successful request has data
          const data: T = isBlob
            ? await response.blob()
            : await response.json();
          apiResponse = { success: true, data: data };
        } else {
          // Successful request does not have data
          apiResponse = { success: true };
        }
      } else if (status === 429) {
        // Request must be re-attempted after x seconds
        const json = await response.json();
        await wait(json.retry_after);
      } else {
        // Request failed for unknown reason
        requestComplete = true;
        console.error("Request could not be completed", response);
      }
    }
    return apiResponse;
  } catch (e) {
    console.error("Request threw an exception", e);
    return apiResponse;
  }
};

export const getUser = (authorization: string, userId: string) =>
  withRetry<User>(() =>
    fetch(`${DISCORD_USERS_ENDPOINT}/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

export const fetchUserData = (authorization: string) =>
  withRetry<User>(() =>
    fetch(`${DISCORD_USERS_ENDPOINT}/@me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

export const fetchGuildUser = (
  guildId: string,
  userId: string,
  authorization: string
) =>
  withRetry<GuildMemberObject>(() =>
    fetch(`${DISCORD_GUILDS_ENDPOINT}/${guildId}/members/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

export const fetchDirectMessages = (authorization: string) =>
  withRetry<Channel[]>(() =>
    fetch(`${DISCORD_USERS_ENDPOINT}/@me/channels`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

export const fetchGuilds = (authorization: string) =>
  withRetry<Guild[]>(() =>
    fetch(`${DISCORD_USERS_ENDPOINT}/@me/guilds`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

export const fetchRoles = (guildId: string, authorization: string) =>
  withRetry<Role[]>(() =>
    fetch(`${DISCORD_GUILDS_ENDPOINT}/${guildId}/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

export const fetchChannels = (authorization: string, guildId: string) =>
  withRetry<Channel[]>(() =>
    fetch(`${DISCORD_GUILDS_ENDPOINT}/${guildId}/channels`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

export const fetchChannel = (authorization: string, channelId: string) =>
  withRetry<Channel>(() =>
    fetch(`${DISCORD_CHANNELS_ENDPOINT}/${channelId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

type GuildChannelModify = {
  name?: string;
  type?: number;
  position?: number | Maybe;
  topic?: string | Maybe;
  nsfw?: boolean | Maybe;
  rate_limit_peruser?: number | Maybe;
  bitrate?: number | Maybe;
  user_limit?: number | Maybe;
  permission_overwrites?: OverwriteObject[] | Maybe;
  parent_id?: string | Maybe;
  rtc_region?: string | Maybe;
  video_quality_mode?: number | Maybe;
  default_auto_archive_duration?: number | Maybe;
  flags?: number;
  available_tags?: ForumTagObject[];
  default_reaction_emoji?: DefaultReactionObject | Maybe;
  default_thread_rate_limit_per_user?: number;
  default_sort_order?: number | Maybe;
  default_forum_layout?: number;
};

type ThreadModify = {
  name?: string;
  archived?: boolean;
  auto_archive_duration?: number;
  locked?: boolean;
  invitable?: boolean;
  rate_limit_per_user?: number | Maybe;
  flags?: number;
  applied_tags?: string[];
};

export const editChannel = (
  authorization: string,
  channelId: string,
  updateObj: ThreadModify | GuildChannelModify
) =>
  withRetry<Channel>(() =>
    fetch(`${DISCORD_CHANNELS_ENDPOINT}/${channelId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
      body: JSON.stringify({ ...updateObj }),
    })
  );

type MessageModify = {
  content?: string;
  embeds?: Embed[];
  flags?: number;
  allowed_mentions?: AllowedMentionObject;
  components?: ComponentObject;
  payload_json?: string;
  attachments?: Attachment[];
};

export const editMessage = (
  authorization: string,
  messageId: string,
  updateProps: MessageModify,
  channelId: string
) =>
  withRetry<Message>(() =>
    fetch(`${DISCORD_CHANNELS_ENDPOINT}/${channelId}/messages/${messageId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
      body: JSON.stringify({ ...updateProps }),
    })
  );

export const deleteMessage = (
  authorization: string,
  messageId: string,
  channelId: string
) =>
  withRetry(() =>
    fetch(`${DISCORD_CHANNELS_ENDPOINT}/${channelId}/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

export const fetchMessageData = (
  authorization: string,
  lastId: string,
  channelId: string,
  queryParam: QueryStringParam = QueryStringParam.BEFORE
) =>
  withRetry<Message[]>(() =>
    fetch(
      `${DISCORD_CHANNELS_ENDPOINT}/${channelId}/messages?limit=${
        queryParam === QueryStringParam.AROUND ? "50" : "100"
      }${lastId.length > 0 ? `&${queryParam}=${lastId}` : ""}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: authorization,
          "user-agent": userAgent,
        },
      }
    )
  );

type SearchMessageResult = {
  messages: Message[];
  threads: Channel[];
  total_results: number;
};

export const fetchSearchMessageData = (
  authorization: string,
  offset: number,
  channelId: string | Maybe,
  guildId: string | Maybe,
  searchCriteria: SearchMessageProps
) => {
  const {
    preFilterUserId,
    searchAfterDate,
    searchBeforeDate,
    searchMessageContent,
    selectedHasTypes,
  } = searchCriteria;
  const urlSearchParams = new URLSearchParams({
    author_id: preFilterUserId || "null",
    min_id: searchAfterDate ? generateSnowflake(searchAfterDate) : "null",
    max_id: searchBeforeDate ? generateSnowflake(searchBeforeDate) : "null",
    content: searchMessageContent || "null",
    channel_id: guildId && channelId ? channelId : "null",
    include_nsfw: "true",
  });
  selectedHasTypes?.forEach((type: string) => {
    urlSearchParams.append("has", type);
  });
  const nullKeys: string[] = [];
  urlSearchParams.forEach((value, key) => {
    if (value === "null") {
      nullKeys.push(key);
    }
  });
  nullKeys.forEach((key) => {
    urlSearchParams.delete(key);
  });

  return withRetry<SearchMessageResult>(() =>
    fetch(
      `${guildId ? DISCORD_GUILDS_ENDPOINT : DISCORD_CHANNELS_ENDPOINT}/${
        guildId || channelId
      }/messages/search?${urlSearchParams.toString()}${
        offset > 0 ? `&offset=${offset}` : ""
      }`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: authorization,
          "user-agent": userAgent,
        },
      }
    )
  );
};

export const fetchPrivateThreads = (authorization: string, channelId: string) =>
  withRetry<Channel[]>(() =>
    fetch(
      `${DISCORD_CHANNELS_ENDPOINT}/${channelId}/threads/archived/private`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: authorization,
          "user-agent": userAgent,
        },
      }
    )
  );

export const fetchPublicThreads = (authorization: string, channelId: string) =>
  withRetry<Channel[]>(() =>
    fetch(`${DISCORD_CHANNELS_ENDPOINT}/${channelId}/threads/archived/public`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

export const createDm = (authorization: string, recipient_id: string) =>
  withRetry<unknown>(() =>
    fetch(`${DISCORD_USERS_ENDPOINT}/@me/channels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
      body: JSON.stringify({ recipient_id }),
    })
  );

export const sendFriendRequest = (
  authorization: string,
  props: { username: string; discriminator: string }
) =>
  withRetry<unknown>(() =>
    fetch(`${DISCORD_USERS_ENDPOINT}/@me/relationships`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
      body: JSON.stringify(props),
    })
  );

export const deleteFriendRequest = (authorization: string, userId: string) =>
  withRetry<unknown>(() =>
    fetch(`${DISCORD_USERS_ENDPOINT}/@me/relationships/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

export const getRelationships = (authorization: string) =>
  withRetry<unknown[]>(() =>
    fetch(`${DISCORD_USERS_ENDPOINT}/@me/relationships`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    })
  );

export const downloadFile = (downloadUrl: string) =>
  withRetry<Blob>(() => fetch(downloadUrl), true);

export const getReactions = (
  authorization: string,
  channelId: Snowflake,
  messageId: Snowflake,
  emoji: string,
  type: ReactionType,
  lastId?: Snowflake | null
) =>
  withRetry<User[]>(() =>
    fetch(
      `${DISCORD_CHANNELS_ENDPOINT}/${channelId}/messages/${messageId}/reactions/${emoji}?limit=100&type=${type}${
        lastId ? `&after=${lastId}` : ""
      }`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: authorization,
          "user-agent": userAgent,
        },
      }
    )
  );

export const deleteReaction = (
  authorization: string,
  channelId: Snowflake,
  messageId: Snowflake,
  emoji: string
) =>
  withRetry(() =>
    fetch(
      `${DISCORD_CHANNELS_ENDPOINT}/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: authorization,
          "user-agent": userAgent,
        },
      }
    )
  );
