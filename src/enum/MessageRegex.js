export const MessageRegex = Object.freeze({
  BOLD: /\*\*(?<text>[^*]+)(?=(\*\*))\*\*/g,
  LINK: /(?:(?<name>\[[^\]]+\])(?<url>\([^ )]+)?(?<description>[^[]*(?=(?:'|")\))'\))?)/g,
  QUOTE: /`(?<text>[^`]+)(?=(`))`/g,
  CHANNEL_MENTION: /<#(?<channel_id>\d+)>/g,
  HYPER_LINK: /(^|\s)(http(s)?:\/\/)+[^\s]+(?=[\s])?/g,
  UNDER_LINE: /__(?<text>[^_]+)(?=(__))__/g,
  ITALICS: /(_|\*)(?<text>[^_*]+)(?=((_|\*)(\s|$)))(_|\*)/g,
  CODE: /```(?<text>[^`]+)(?=(```))```/g,
  USER_MENTION: /<@(?:&|!)?(?<user_id>[0-9]+)>/g,
  EMOJI: /<a:[^<>]+:[0-9]+>|<:[^<>]+:[0-9]+>/g,
  WINDOWS_INVALID_CHARACTERS: /\[|<|>|:|"|\/|\\|\||\?|\*|\]/g,
});
