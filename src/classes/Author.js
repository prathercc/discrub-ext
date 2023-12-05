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
    this.id = id;
    this.username = username;
    this.global_name = global_name;
    this.avatar = avatar;
    this.avatar_decoration_data = avatar_decoration_data;
    this.discriminator = discriminator;
    this.public_flags = public_flags;
    this.premium_type = premium_type;
    this.bot = bot;
    this.flags = flags;
    this.banner = banner;
    this.accent_color = accent_color;
    this.banner_color = banner_color;
  }

  isBot() {
    return !!this.bot;
  }
}
export default Author;
