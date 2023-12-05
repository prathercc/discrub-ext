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
