/* global BigInt */
const discordUsersUrl = "https://discord.com/api/v10/users";
const discordGuildsUrl = "https://discord.com/api/v10/guilds";
const discordChannelsUrl = "https://discord.com/api/v10/channels";
const userAgent =
  "Mozilla/5.0 (X11; Linux x86_64; rv:17.0) Gecko/20121202 Firefox/17.0 Iceweasel/17.0.1";

export const createDm = (authorization, recipient_id) => {
  return fetch(`${discordUsersUrl}/@me/channels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
    body: JSON.stringify({ recipient_id }),
  }).then((resp) => resp.json());
};
export const sendFriendRequest = (
  authorization,
  user = { username: null, discriminator: null }
) => {
  return fetch(`${discordUsersUrl}/@me/relationships`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
    body: JSON.stringify(user),
  }).then((resp) => resp.json());
};
export const deleteFriendRequest = (authorization, userId) => {
  return fetch(`${discordUsersUrl}/@me/relationships/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
  }).then((resp) => resp.json());
};
export const getRelationships = (authorization) => {
  return fetch(`${discordUsersUrl}/@me/relationships`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
  }).then((resp) => resp.json());
};
export const fetchUserData = (authorization) => {
  return fetch(`${discordUsersUrl}/@me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
  }).then((resp) => resp.json());
};
export const fetchDirectMessages = (authorization) => {
  return fetch(`${discordUsersUrl}/@me/channels`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
  }).then((resp) => resp.json());
};
export const fetchGuilds = (authorization) => {
  return fetch(`${discordUsersUrl}/@me/guilds`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
  }).then((resp) => resp.json());
};
export const fetchChannels = (authorization, guildId) => {
  return fetch(`${discordGuildsUrl}/${guildId}/channels`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
  }).then((resp) => resp.json());
};

export const editMessage = (authorization, messageId, updateObj, channelId) => {
  return fetch(`${discordChannelsUrl}/${channelId}/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
    body: JSON.stringify({ ...updateObj }),
  }).then((resp) => resp.json());
};
export const deleteMessage = (authorization, messageId, channelId) => {
  return fetch(`${discordChannelsUrl}/${channelId}/messages/${messageId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
  }).then((resp) => {
    if (resp.status === 429) return resp.json();
    else return resp;
  });
};

export const fetchMessageData = (authorization, lastId, channelId) => {
  return fetch(
    `${discordChannelsUrl}/${channelId}/messages?limit=100${
      lastId.length > 0 ? `&before=${lastId}` : ""
    }`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: authorization,
        "user-agent": userAgent,
      },
    }
  ).then((resp) => resp.json());
};

export const fetchSearchMessageData = (
  authorization,
  offset,
  channelId,
  guildId,
  searchCriteria
) => {
  const generateSnowflake = (date) => {
    if (date === null) {
      return null;
    } else {
      const timestamp = date.valueOf();
      const result = (BigInt(timestamp) - BigInt(1420070400000)) << BigInt(22);
      return result.toString();
    }
  };
  const { preFilterUserId, searchAfterDate, searchBeforeDate } = searchCriteria;
  const urlSearchParams = new URLSearchParams({
    author_id: preFilterUserId,
    min_id: generateSnowflake(searchAfterDate),
    max_id: generateSnowflake(searchBeforeDate),
    channel_id: guildId ? channelId : "null",
  });
  const nullKeys = [];
  urlSearchParams.forEach((value, key) => {
    if (value === "null") {
      nullKeys.push(key);
    }
  });
  nullKeys.forEach((key) => {
    urlSearchParams.delete(key);
  });
  return fetch(
    `${guildId ? discordGuildsUrl : discordChannelsUrl}/${
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
  ).then((resp) => resp.json());
};

export const fetchThreads = async (authorization, channelId) => {
  const privateThreads = await _fetchPrivateThreads(authorization, channelId);
  const publicThreads = await _fetchPublicThreads(authorization, channelId);
  return privateThreads.threads?.concat(publicThreads.threads) || [];
};

const _fetchPrivateThreads = (authorization, channelId) => {
  return fetch(`${discordChannelsUrl}/${channelId}/threads/archived/private`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
  }).then((resp) => resp.json());
};

const _fetchPublicThreads = (authorization, channelId) => {
  return fetch(`${discordChannelsUrl}/${channelId}/threads/archived/public`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: authorization,
      "user-agent": userAgent,
    },
  }).then((resp) => resp.json());
};
