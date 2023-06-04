/**
 *
 * @param {*} a Compare from
 * @param {*} b Compare to
 * @param {String} property Object property
 * @returns
 */
export const sortByProperty = (a, b, property) => {
  return a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
};
