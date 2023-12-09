/* eslint-disable no-unused-vars */
class Author {
  constructor(json) {
    const {
      id,
      username,
      global_name,
      avatar,
      avatar_decoration_data,
      discriminator,
      public_flags,
      premium_type,
      bot,
      flags,
      banner,
      accent_color,
      banner_color,
    } = json;
    Object.assign(this, json);
  }

  getUserName() {
    return this.username;
  }

  isBot() {
    return !!this.bot;
  }
}
export default Author;
