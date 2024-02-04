import { getIconUrl } from "../utils";
import Guild from "../classes/guild";
import Channel from "../classes/channel";

type EntityIconProps = {
  entity: Guild | Channel;
};
const EntityIcon = ({ entity }: EntityIconProps) => {
  return (
    <img
      style={{ width: "24px", height: "24px", borderRadius: "50px" }}
      src={getIconUrl(entity)}
      alt="guild-icon"
    />
  );
};

export default EntityIcon;
