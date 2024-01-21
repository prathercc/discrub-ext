// https://discord.com/developers/docs/resources/channel#reaction-object
import { ReactionCountDetailsObject } from "../types/reaction-count-details-object";
import { Emoji } from "./emoji";

export class Reaction {
  count: number;
  count_details: ReactionCountDetailsObject;
  me: boolean;
  me_burst: boolean;
  emoji: Emoji;
  burst_colors: string[];

  constructor(opts: {
    count: number;
    count_details: ReactionCountDetailsObject;
    me: boolean;
    me_burst: boolean;
    emoji: Emoji;
    burst_colors: string[];
  }) {
    this.count = opts.count;
    this.count_details = opts.count_details;
    this.me = opts.me;
    this.me_burst = opts.me_burst;
    this.emoji = opts.emoji;
    this.burst_colors = opts.burst_colors;
  }
}
