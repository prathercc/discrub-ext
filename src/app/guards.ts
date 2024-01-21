import Attachment from "../classes/attachment";
import Guild from "../classes/guild";
import Message from "../classes/message";
import Role from "../classes/role";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isMessage = (entity: any): entity is Message => {
  const message = entity as Message;
  return (
    message.content !== undefined &&
    message.attachments !== undefined &&
    message.embeds !== undefined
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isGuild = (entity: any): entity is Guild => {
  const guild = entity as Guild;
  return guild.emojis !== undefined && guild.roles !== undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRole = (entity: any): entity is Role => {
  const role = entity as Role;
  return role.color !== undefined && role.hoist !== undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isAttachment = (entity: any): entity is Attachment => {
  const attachment = entity as Attachment;
  return attachment.filename !== undefined;
};
