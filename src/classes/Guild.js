import { sortByProperty } from "../utils";

/* eslint-disable no-unused-vars */
class Guild {
  constructor(json = {}) {
    const { features, icon, id, name, owner, permissions, permissions_new } =
      json;
    Object.assign(this, json, { roles: null });
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getRoles() {
    return this.roles;
  }

  /**
   *
   * @param {Array} roleIds Array of String roleIds
   * @returns An object containing Role entities for the highest position color and icon
   */
  getHighestRoles(roleIds = []) {
    if (!Boolean(this.getRoles())) {
      return null;
    }

    const applicableRoles = this.getRoles().filter(
      (role) =>
        roleIds.some((id) => id === role.getId()) && Boolean(role.getPosition())
    );

    const colorRole =
      this._orderRoles(
        applicableRoles.filter((role) => Boolean(role.getRawColor()))
      )?.[0] || null;

    const iconRole =
      this._orderRoles(
        applicableRoles.filter((role) => Boolean(role.getIconUrl()))
      )?.[0] || null;

    return { colorRole, iconRole };
  }

  /**
   *
   * @param {Array} roles Array of Roles to be ordered
   * @returns An ordered array of Roles, descending by position
   */
  _orderRoles = (roles = []) => {
    return roles.toSorted((a, b) => sortByProperty(a, b, "position", "desc"));
  };
}
export default Guild;
