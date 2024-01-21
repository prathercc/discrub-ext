import { getIconUrl } from "../utils";
import Guild from "../classes/guild";

type GuildIconProps = {
  guild: Guild;
};
export const GuildIcon = ({ guild }: GuildIconProps) => {
  return (
    <img
      style={{ width: "24px", height: "24px", borderRadius: "50px" }}
      src={getIconUrl(guild)}
      alt="guild-icon"
    />
  );
};
