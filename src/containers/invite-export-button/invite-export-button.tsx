import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ConstructionIcon from "@mui/icons-material/Construction";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import classNames from "classnames";
import EnhancedDialogTitle from "../../common-components/enhanced-dialog/enhanced-dialog-title.tsx";
import { useGuildSlice } from "../../features/guild/use-guild-slice.ts";
import { useUserSlice } from "../../features/user/use-user-slice.ts";
import DiscordService from "../../services/discord-service.ts";
import { useAppSlice } from "../../features/app/use-app-slice.ts";
import { getOsSafeString } from "../../utils.ts";
import { ChannelType } from "../../enum/channel-type.ts";
import { nanoid } from "nanoid";
import { DiscrubSetting } from "../../enum/discrub-setting.ts";
import { AppSettings } from "../../features/app/app-types.ts";
import "../purge-button/css/purge-status-header.css";

type InviteExportButtonProps = {
  disabled?: boolean;
  showTrigger?: boolean;
  openSignal?: number;
};

type LogLevel = "info" | "ok" | "error";

type LogEntry = {
  id: string;
  text: string;
  level: LogLevel;
};

type InviteResult = {
  guildName: string;
  inviteUrl?: string;
  reason?: string;
  ok: boolean;
};

enum InviteInstruction {
  AWAITING_INSTRUCTION = "Awaiting Instruction",
  EXPORTING = "Exporting Invites",
  OPERATION_COMPLETE = "Operation Complete",
  OPERATION_FAILED = "Operation Failed",
}

const LOG_LIMIT = 1200;

const INVITE_CHANNEL_TYPES = new Set<number>([
  ChannelType.GUILD_TEXT,
  ChannelType.GUILD_VOICE,
  ChannelType.GUILD_ANNOUNCEMENT,
  ChannelType.GUILD_STAGE_VOICE,
  ChannelType.GUILD_FORUM,
  ChannelType.GUILD_MEDIA,
]);
const INVITE_FAST_CHANNEL_TYPES = new Set<number>([
  ChannelType.GUILD_TEXT,
  ChannelType.GUILD_ANNOUNCEMENT,
  ChannelType.GUILD_FORUM,
  ChannelType.GUILD_MEDIA,
]);
const INVITE_PERMISSION_BREAK_THRESHOLD = 12;

const downloadTextFile = (fileName: string, text: string) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

const buildInviteExportText = (results: InviteResult[]): string => {
  const generated = new Date().toLocaleString();
  const okCount = results.filter((result) => result.ok).length;
  const failCount = results.length - okCount;

  const lines: string[] = [
    "Discord Invite Exporter",
    "",
    `Generated: ${generated}`,
    `Guilds: ${results.length}  |  OK: ${okCount}  |  Failed: ${failCount}`,
    "-------------------------------------",
  ];

  for (const result of results) {
    if (result.ok && result.inviteUrl) {
      lines.push(`[OK] ${result.guildName}`);
      lines.push(result.inviteUrl);
      lines.push("");
    } else {
      lines.push(`[ERR] ${result.guildName}`);
      lines.push(result.reason || "unknown error");
      lines.push("");
    }
  }

  lines.push("-------------------------------------");
  return lines.join("\n");
};

const normalizeInviteUrl = (value: string): string | null => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (raw.startsWith("https://discord.gg/")) return raw;
  if (raw.startsWith("http://discord.gg/")) {
    return raw.replace("http://discord.gg/", "https://discord.gg/");
  }
  if (raw.startsWith("https://discord.com/invite/")) {
    const code = raw.split("/invite/")[1]?.split("?")[0];
    return code ? `https://discord.gg/${code}` : null;
  }
  if (raw.startsWith("http://discord.com/invite/")) {
    const code = raw.split("/invite/")[1]?.split("?")[0];
    return code ? `https://discord.gg/${code}` : null;
  }
  if (/^[a-zA-Z0-9-]{2,}$/.test(raw)) {
    return `https://discord.gg/${raw}`;
  }
  return null;
};

const InviteExportButton = ({
  disabled = false,
  showTrigger = true,
  openSignal,
}: InviteExportButtonProps) => {
  const { state: guildState, getGuilds } = useGuildSlice();
  const guilds = guildState.guilds();
  const guildLoading = guildState.isLoading();

  const { state: userState } = useUserSlice();
  const token = userState.token();

  const { state: appState } = useAppSlice();
  const settings = appState.settings();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [instruction, setInstruction] = useState<InviteInstruction>(
    InviteInstruction.AWAITING_INSTRUCTION,
  );
  const [isExporting, setIsExporting] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const abortRef = useRef(false);
  const lastOpenSignalRef = useRef<number | undefined>(openSignal);

  const sortedGuilds = useMemo(
    () => [...guilds].sort((a, b) => a.name.localeCompare(b.name)),
    [guilds],
  );

  useEffect(() => {
    if (token && !guildLoading && guilds.length === 0) {
      getGuilds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, guildLoading, guilds.length]);

  useEffect(() => {
    if (
      typeof openSignal === "number" &&
      openSignal !== lastOpenSignalRef.current
    ) {
      setDialogOpen(true);
    }
    lastOpenSignalRef.current = openSignal;
  }, [openSignal]);

  const appendLog = (text: string, level: LogLevel = "info") => {
    setLogs((prevState) =>
      [{ id: nanoid(), text, level }, ...prevState].slice(0, LOG_LIMIT),
    );
  };

  const getLogRow = ({ index, style }: ListChildComponentProps) => {
    const row = logs[index];
    const color =
      row.level === "ok"
        ? "success.main"
        : row.level === "error"
          ? "error.main"
          : "text.primary";

    return (
      <ListItem style={style} key={row.id} dense divider>
        <Typography variant="body2" sx={{ color, fontFamily: "monospace" }}>
          {row.text}
        </Typography>
      </ListItem>
    );
  };

  const handleClose = () => {
    if (isExporting) {
      if (stopRequested) {
        return;
      }
      abortRef.current = true;
      setStopRequested(true);
      appendLog("Stop requested. Finishing current step...", "error");
      return;
    }
    setDialogOpen(false);
  };

  const handleShowDownloadSetup = () => {
    window.alert(
      [
        "Configure Chrome downloads before export:",
        "1) Open a new tab manually: chrome://settings/downloads",
        "2) Set your preferred Download location",
        "3) Disable 'Ask where to save each file before downloading'",
      ].join("\n"),
    );
  };

  const handleExportInvites = async () => {
    if (!token || isExporting || !sortedGuilds.length) return;

    const allowed = window.confirm(
      "Export Invites will call Discord API across all servers and create a file download. Make sure Chrome download folder settings are ready. Continue?",
    );
    if (!allowed) return;

    const noDelaySettings: AppSettings = {
      ...settings,
      [DiscrubSetting.SEARCH_DELAY]: "0",
      [DiscrubSetting.DELAY_MODIFIER]: "0",
    };

    const discordService = new DiscordService(noDelaySettings);
    const results: InviteResult[] = [];

    abortRef.current = false;
    setLogs([]);
    setIsExporting(true);
    setStopRequested(false);
    setInstruction(InviteInstruction.EXPORTING);
    appendLog(`Starting invite export for ${sortedGuilds.length} guild(s).`);

    try {
      for (let index = 0; index < sortedGuilds.length; index++) {
        if (abortRef.current) break;

        const guild = sortedGuilds[index];
        appendLog(`Scanning guild ${index + 1}/${sortedGuilds.length}: ${guild.name}`);

        const vanityResponse = await discordService.fetchGuildVanityInvite(
          token,
          guild.id,
        );
        const vanityCode = vanityResponse.data?.code || undefined;
        if (vanityResponse.success && vanityCode) {
          const inviteUrl = `https://discord.gg/${vanityCode}`;
          results.push({ guildName: guild.name, ok: true, inviteUrl });
          appendLog(`[OK] ${guild.name} -> ${inviteUrl} (vanity)`, "ok");
          continue;
        }

        const guildDataResponse = await discordService.fetchGuildAssetData(
          token,
          guild.id,
        );
        const fallbackVanity = normalizeInviteUrl(
          guildDataResponse.data?.vanity_url_code || "",
        );
        if (fallbackVanity) {
          results.push({ guildName: guild.name, ok: true, inviteUrl: fallbackVanity });
          appendLog(`[OK] ${guild.name} -> ${fallbackVanity} (guild data)`, "ok");
          continue;
        }

        const widgetResponse = await discordService.fetchGuildWidget(
          token,
          guild.id,
        );
        const widgetInvite = normalizeInviteUrl(
          widgetResponse.data?.instant_invite || "",
        );
        if (widgetInvite) {
          results.push({ guildName: guild.name, ok: true, inviteUrl: widgetInvite });
          appendLog(`[OK] ${guild.name} -> ${widgetInvite} (widget)`, "ok");
          continue;
        }

        const channelsResponse = await discordService.fetchChannels(
          token,
          guild.id,
        );
        const channels = channelsResponse.data || [];

        if (!channelsResponse.success || !channels.length) {
          const reason =
            channelsResponse.status === 403
              ? "no permission"
              : "unknown error on all channels";
          results.push({ guildName: guild.name, ok: false, reason });
          appendLog(`[ERR] ${guild.name} -> ${reason}`, "error");
          continue;
        }

        const channelCandidates = channels
          .filter((channel) => INVITE_CHANNEL_TYPES.has(channel.type))
          .sort((a, b) => {
            const aFast = INVITE_FAST_CHANNEL_TYPES.has(a.type) ? 0 : 1;
            const bFast = INVITE_FAST_CHANNEL_TYPES.has(b.type) ? 0 : 1;
            return aFast - bFast;
          });
        appendLog(
          `Guild channels to test: ${channelCandidates.length}`,
        );

        let inviteUrl: string | undefined;
        let permissionDenied = false;
        let unknownErrors = 0;
        let createdInvite = false;
        let deniedStreak = 0;

        for (let cIndex = 0; cIndex < channelCandidates.length; cIndex++) {
          if (abortRef.current) break;

          const channel = channelCandidates[cIndex];
          if (cIndex % 25 === 0) {
            appendLog(
              `Invite lookup progress: ${cIndex + 1}/${channelCandidates.length}`,
            );
          }

          const createInviteResponse = await discordService.createChannelInvite(
            token,
            channel.id,
          );

          if (createInviteResponse.success && createInviteResponse.data?.code) {
            inviteUrl = `https://discord.gg/${createInviteResponse.data.code}`;
            createdInvite = true;
            break;
          }

          if (createInviteResponse.status === 403) {
            permissionDenied = true;
            deniedStreak += 1;
          } else if (createInviteResponse.status) {
            deniedStreak = 0;
            unknownErrors += 1;
          }

          const response = await discordService.fetchChannelInvites(
            token,
            channel.id,
          );
          const invites = response.data || [];
          const existingInvite = invites.find(
            (invite) => typeof invite.code === "string" && invite.code.length > 0,
          );

          if (existingInvite?.code) {
            inviteUrl = `https://discord.gg/${existingInvite.code}`;
            break;
          }

          if (!response.success) {
            if (response.status === 403) {
              permissionDenied = true;
              deniedStreak += 1;
            } else {
              deniedStreak = 0;
              unknownErrors += 1;
            }
          } else {
            deniedStreak = 0;
          }

          if (
            deniedStreak >= INVITE_PERMISSION_BREAK_THRESHOLD &&
            cIndex >= INVITE_PERMISSION_BREAK_THRESHOLD - 1
          ) {
            appendLog("[INFO] Early stop: repeated no-permission responses.");
            break;
          }
        }

        if (inviteUrl) {
          results.push({ guildName: guild.name, ok: true, inviteUrl });
          appendLog(
            `[OK] ${guild.name} -> ${inviteUrl}${createdInvite ? " (created)" : ""}`,
            "ok",
          );
        } else {
          const reason =
            permissionDenied && unknownErrors === 0
              ? "no permission"
              : unknownErrors === 0
                ? "no invite found"
                : "unknown error on channels";

          results.push({ guildName: guild.name, ok: false, reason });
          appendLog(`[ERR] ${guild.name} -> ${reason}`, "error");
        }
      }

      if (results.length) {
        const text = buildInviteExportText(results);
        const fileName = `discord_invites_${getOsSafeString(
          new Date().toISOString().replace(/:/g, "-"),
        )}.txt`;
        downloadTextFile(fileName, text);

        const okCount = results.filter((result) => result.ok).length;
        appendLog(
          `Export file downloaded. OK: ${okCount}, Failed: ${results.length - okCount}.`,
          "ok",
        );
      } else {
        appendLog("No guild results to export.", "error");
      }

      setInstruction(
        abortRef.current
          ? InviteInstruction.OPERATION_FAILED
          : InviteInstruction.OPERATION_COMPLETE,
      );
    } catch (error) {
      console.error(error);
      appendLog("Invite export failed due to unexpected error.", "error");
      setInstruction(InviteInstruction.OPERATION_FAILED);
    } finally {
      setIsExporting(false);
      setStopRequested(false);
      abortRef.current = false;
    }
  };

  const getInstructionIcon = () => {
    if (instruction === InviteInstruction.EXPORTING) {
      return <ConstructionIcon />;
    }
    if (instruction === InviteInstruction.OPERATION_COMPLETE) {
      return <TaskAltIcon />;
    }
    if (instruction === InviteInstruction.OPERATION_FAILED) {
      return <ErrorOutlineIcon />;
    }
    return <SmartToyIcon />;
  };

  return (
    <>
      {showTrigger ? (
        <Button
          disabled={disabled || !token || (!guilds.length && !guildLoading)}
          onClick={() => setDialogOpen(true)}
          variant="contained"
        >
          Export Invites
        </Button>
      ) : null}

      <Dialog
        hideBackdrop
        PaperProps={{ sx: { minWidth: "600px", minHeight: "500px" } }}
        open={dialogOpen}
      >
        <EnhancedDialogTitle title="Export Invites" onClose={handleClose} />
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Box
              className={classNames({
                "operation-running": instruction === InviteInstruction.EXPORTING,
              })}
            >
              {getInstructionIcon()}
            </Box>
            <Typography variant="h6">{instruction}</Typography>
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%", maxWidth: 560 }}
          >
            <Typography variant="body2" color="warning.main">
              Warning: this runs on all servers and creates a download file.
            </Typography>
            <Button
              color="secondary"
              startIcon={<InfoOutlinedIcon />}
              variant="contained"
              onClick={handleShowDownloadSetup}
            >
              Download Setup
            </Button>
          </Stack>

          <Box
            sx={{
              width: "100%",
              maxWidth: 560,
              height: 320,
              backgroundColor: "background.paper",
            }}
          >
            <FixedSizeList
              height={320}
              width={560}
              itemSize={36}
              itemCount={logs.length}
            >
              {getLogRow}
            </FixedSizeList>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            alignItems="center"
          >
            <Button
              color="secondary"
              variant="contained"
              onClick={handleClose}
              disabled={isExporting && stopRequested}
            >
              {isExporting ? (stopRequested ? "Stopping..." : "Stop") : "Close"}
            </Button>
            <Button
              disabled={isExporting || !sortedGuilds.length}
              variant="contained"
              onClick={handleExportInvites}
            >
              Export
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InviteExportButton;
