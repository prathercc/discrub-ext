import { MessageRegex } from "./enum/MessageRegex";

/**
 *
 * @param {*} a Compare from
 * @param {*} b Compare to
 * @param {String} property Object property
 * @param {String} direction Possible directions: 'desc' or 'asc'. (Default = 'asc')
 * @returns
 */
export const sortByProperty = (a, b, property, direction = "asc") =>
  a[property] < b[property]
    ? direction === "asc"
      ? -1
      : 1
    : a[property] > b[property]
    ? direction === "asc"
      ? 1
      : -1
    : 0;

/**
 *
 * @param {Number} seconds Number of seconds to wait for
 * @param {Function} callback Optional function to be used after the specified seconds have passed
 */
export const wait = async (seconds, callback = () => {}) => {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  return callback();
};

/**
 *
 * @param {Date} date Date object to retrieve timezone from
 * @returns Timezone as String
 */
export const getTimeZone = (date = new Date()) => {
  return date
    .toLocaleTimeString(undefined, { timeZoneName: "short" })
    .split(" ")[2];
};

/**
 *
 * @param {Number} index The index to check the percentage of
 * @param {Number} total The total number that to check the percentage from
 * @returns
 */
export const getPercent = (index, total) => {
  return ((index / total) * 100).toString().split(".")[0];
};

/**
 *
 * @param {Number} color Integer representation of hexadecimal color code
 * @returns Hexadecimal color code
 */
export const colorToHex = (color) => {
  if (!Boolean(color)) {
    return "#FFF";
  }

  return `#${color.toString(16)}`;
};

export const getSafeExportName = (name) => {
  const matchedWindowsCharacters =
    name.match(MessageRegex.WINDOWS_INVALID_CHARACTERS) || [];
  let retStr = name;
  matchedWindowsCharacters.forEach((char) => {
    retStr = retStr.replaceAll(char, "");
  });
  return retStr;
};
