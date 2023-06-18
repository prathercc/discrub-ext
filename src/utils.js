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
