import {
  formatUserData,
  getIconUrl,
  getColor,
  getHighestRoles,
  getRoleNames,
} from "../../../utils";
import CheckIcon from "@mui/icons-material/Check";
import Message from "../../../classes/message";
import Role from "../../../classes/role";
import {
  ExportRoleMap,
  ExportUserMap,
} from "../../../features/export/export-types";
import Guild from "../../../classes/guild";

export type AuthorNameProps = {
  msg: Message;
  userMap: ExportUserMap;
  roleMap: ExportRoleMap;
  selectedGuild: Guild | Maybe;
};

const AuthorName = ({
  msg,
  userMap,
  roleMap,
  selectedGuild,
}: AuthorNameProps) => {
  const author = msg.author;

  const {
    roles: guildRoles,
    nick: guildNickname,
    joinedAt,
  } = userMap[author.id]?.guilds[String(selectedGuild?.id)] || {};

  let roleNames: string[] = [];
  let colorRole: Role | Maybe = null;
  let iconRole: Role | Maybe = null;

  if (selectedGuild) {
    const highestRole = getHighestRoles(guildRoles, selectedGuild);
    if (highestRole) {
      colorRole = highestRole.colorRole;
      iconRole = highestRole.iconRole;
    }
    roleNames = getRoleNames(guildRoles, selectedGuild);
  }

  return (
    <>
      <strong
        title={formatUserData({
          userId: author.id,
          userName: author.username,
          displayName: author.global_name,
          guildNickname,
          joinedAt,
          roleNames,
        })}
        style={{ color: colorRole ? getColor(colorRole.color) : undefined }}
      >
        {guildNickname || author.global_name || author.username}
      </strong>
      {iconRole && (
        <img
          title={iconRole.name}
          style={{ width: "20px", height: "20px" }}
          src={
            roleMap[String(getIconUrl(iconRole))] ||
            getIconUrl(iconRole) ||
            undefined
          }
          alt="role-icon"
        />
      )}
      {!iconRole && msg.author.bot && (
        <span
          title="Verified Bot"
          style={{
            color: "#FFF !important",
            backgroundColor: "#5865f2",
            borderRadius: "5px",
            display: "inline-flex",
            fontSize: "10px",
            alignItems: "center",
            justifyContent: "center",
            height: "16px",
            width: "38px",
            gap: "2px",
            wordBreak: "keep-all",
          }}
        >
          <CheckIcon sx={{ width: "12px !important" }} /> BOT
        </span>
      )}
    </>
  );
};
export default AuthorName;
