// https://discord.com/developers/docs/resources/channel#embed-object
import { EmbedFooterObject } from "../types/embed-footer-object";
import { EmbedImageObject } from "../types/embed-image-object";
import { EmbedThumbnailObject } from "../types/embed-thumbnail-object";
import { EmbedVideoObject } from "../types/embed-video-object";
import { EmbedProviderObject } from "../types/embed-provider-object";
import { EmbedAuthorObject } from "../types/embed-author-object";
import { EmbedFieldObject } from "../types/embed-field-object";
import { EmbedType } from "../enum/embed-type";

class Embed {
  title?: string;
  type?: EmbedType;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: EmbedFooterObject;
  image?: EmbedImageObject;
  thumbnail?: EmbedThumbnailObject;
  video?: EmbedVideoObject;
  provider?: EmbedProviderObject;
  author?: EmbedAuthorObject;
  fields?: EmbedFieldObject[];

  constructor(opts: {
    title?: string;
    type?: EmbedType;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: EmbedFooterObject;
    image?: EmbedImageObject;
    thumbnail?: EmbedThumbnailObject;
    video?: EmbedVideoObject;
    provider?: EmbedProviderObject;
    author?: EmbedAuthorObject;
    fields?: EmbedFieldObject[];
  }) {
    this.title = opts.title;
    this.type = opts.type;
    this.description = opts.description;
    this.url = opts.url;
    this.timestamp = opts.timestamp;
    this.color = opts.color;
    this.footer = opts.footer;
    this.image = opts.image;
    this.thumbnail = opts.thumbnail;
    this.video = opts.video;
    this.provider = opts.provider;
    this.author = opts.author;
    this.fields = opts.fields;
  }
}

export default Embed;
