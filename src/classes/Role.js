import { colorToHex } from "../utils";

/* eslint-disable no-unused-vars */
class Role {
  constructor(json) {
    const {
      id,
      name,
      description,
      permissions,
      position,
      color,
      hoist,
      managed,
      mentionable,
      icon,
      unicode_emoji,
      flags,
    } = json;
    Object.assign(this, json);
  }

  getName() {
    return this.name;
  }

  getId() {
    return this.id;
  }

  getColor() {
    return colorToHex(this.color);
  }

  getRawColor() {
    return this.color;
  }

  getPosition() {
    return Number(this.position);
  }

  getIconUrl() {
    if (!Boolean(this.id) || !Boolean(this.icon)) {
      return null;
    }
    return `https://cdn.discordapp.com/role-icons/${this.id}/${this.icon}`;
  }
}

export default Role;
