import Attachment from "../classes/attachment";
import Guild from "../classes/guild";
import Message from "../classes/message";
import Role from "../classes/role";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isMessage = (entity: any): entity is Message => {
  if (!entity) return false;
  const message = entity as Message;
  return (
    "content" in message && "attachments" in message && "embeds" in message
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isGuild = (entity: any): entity is Guild => {
  if (!entity) return false;
  const guild = entity as Guild;
  return "emojis" in guild && "roles" in guild;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRole = (entity: any): entity is Role => {
  if (!entity) return false;
  const role = entity as Role;
  return "color" in role && "hoist" in role;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isAttachment = (entity: any): entity is Attachment => {
  if (!entity) return false;
  const attachment = entity as Attachment;
  return "filename" in attachment;
};
