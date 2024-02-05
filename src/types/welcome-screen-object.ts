// https://discord.com/developers/docs/resources/guild#welcome-screen-object
import { WelcomeScreenChannelObject } from "./welcome-screen-channel-object";

export type WelcomeScreenObject = {
  description: string | Maybe;
  welcome_channels: WelcomeScreenChannelObject[];
};
