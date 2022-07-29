const discordUsersUrl = "https://discordapp.com/api/users";
const discordGuildsUrl = "https://discordapp.com/api/guilds";
const discordChannelsUrl = "https://discordapp.com/api/channels";
const userAgent =
  "Mozilla/5.0 (X11; Linux x86_64; rv:17.0) Gecko/20121202 Firefox/17.0 Iceweasel/17.0.1";

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
