import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  ListItem,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
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
import { nanoid } from "nanoid";
import { DiscrubSetting } from "../../enum/discrub-setting.ts";
import { AppSettings } from "../../features/app/app-types.ts";
import "../purge-button/css/purge-status-header.css";

type EmojiExportButtonProps = {
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

type AssetType = "emoji" | "sticker";

type ManifestItem = {
  type: AssetType;
  id: Snowflake;
  key: string;
  name: string;
  ext: string;
  url: string;
  file: string;
  guildId: Snowflake;
  guildName: string;
};

type ExportAssetMode = "emoji" | "sticker" | "both";

type EmojiAssetCandidate = {
  type: AssetType;
  id: Snowflake;
  key: string;
  name: string;
  ext: string;
  baseUrl: string;
  downloadUrl: string;
  file: string;
  guildId: Snowflake;
  guildName: string;
};

type EmojiExportResumeState = {
  version: 1;
  nextGuildId?: Snowflake;
  seenKeys: string[];
  manifest: ManifestItem[];
  updatedAt: number;
};

enum EmojiInstruction {
  AWAITING_INSTRUCTION = "Awaiting Instruction",
  EXPORTING = "Exporting Emojis",
  OPERATION_COMPLETE = "Operation Complete",
  OPERATION_FAILED = "Operation Failed",
}

const LOG_LIMIT = 1200;
const EMOJI_EXPORT_RESUME_KEY = "discrub_emoji_export_resume_v1";
const GUILD_FETCH_TIMEOUT_MS = 15000;
const DOWNLOAD_TIMEOUT_MS = 12000;
const EMOJI_DOWNLOAD_BATCH_SIZE = 8;

const INVALID_FILE_CHARS = /[<>:"/\\|?*\x00-\x1F]/g;

const cleanAssetName = (value: string) =>
  String(value || "")
    .replace(/^:+|:+$/g, "")
    .replace(/^Sticker,\s*/i, "")
    .replace(INVALID_FILE_CHARS, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "asset";

const getStickerExt = (formatType?: number): string => {
  switch (formatType) {
    case 4:
      return "gif";
    case 3:
      return "json";
    case 2:
      return "png";
    default:
      return "webp";
  }
};

const modeAllowsType = (mode: ExportAssetMode, type: AssetType) => {
  if (mode === "both") return true;
  return mode === type;
};

const stripQuery = (url: string) => {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0];
  }
};

const downloadBlob = (fileName: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

const downloadWithChromeApi = async (url: string, filename: string) => {
  const downloads = globalThis.chrome?.downloads;
  if (!downloads?.download) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    downloads.download(
      {
        url,
        filename,
        saveAs: false,
        conflictAction: "uniquify",
      },
      (downloadId) => {
        const errorMessage = globalThis.chrome?.runtime?.lastError?.message;
        if (errorMessage || typeof downloadId !== "number") {
          reject(
            new Error(errorMessage || `Download failed for ${filename}`),
          );
          return;
        }
        resolve();
      },
    );
  });
};

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> => {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (typeof timeoutId === "number") {
      window.clearTimeout(timeoutId);
    }
  }
};

const normalizeManifestItem = (item: unknown): ManifestItem | null => {
  if (!item || typeof item !== "object") return null;
  const source = item as Record<string, unknown>;

  const type =
    source.type === "sticker"
      ? "sticker"
      : source.type === "emoji"
        ? "emoji"
        : null;

  if (
    !type ||
    typeof source.id !== "string" ||
    typeof source.key !== "string" ||
    typeof source.name !== "string" ||
    typeof source.ext !== "string" ||
    typeof source.url !== "string" ||
    typeof source.file !== "string"
  ) {
    return null;
  }

  const normalizedType: AssetType = type === "emoji" ? "emoji" : "sticker";
  return {
    type: normalizedType,
    id: source.id,
    key: source.key,
    name: source.name,
    ext: source.ext,
    url: stripQuery(source.url),
    file: source.file,
    guildId: typeof source.guildId === "string" ? source.guildId : "",
    guildName: typeof source.guildName === "string" ? source.guildName : "",
  };
};

const getChromeStorage = () => globalThis.chrome?.storage?.local;

const loadResumeState = async (): Promise<EmojiExportResumeState | null> => {
  const storage = getChromeStorage();
  if (!storage) return null;

  const payload = await storage.get(EMOJI_EXPORT_RESUME_KEY);
  const raw = payload[EMOJI_EXPORT_RESUME_KEY] as unknown;
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Partial<EmojiExportResumeState>;
  if (
    data.version !== 1 ||
    !Array.isArray(data.seenKeys) ||
    !Array.isArray(data.manifest)
  ) {
    return null;
  }

  const manifest = data.manifest
    .map((item) => normalizeManifestItem(item))
    .filter((item): item is ManifestItem => item !== null);

  const seenKeys = data.seenKeys.filter(
    (key): key is string => typeof key === "string" && key.includes(":"),
  );

  return {
    version: 1,
    nextGuildId:
      typeof data.nextGuildId === "string" ? data.nextGuildId : undefined,
    seenKeys,
    manifest,
    updatedAt:
      typeof data.updatedAt === "number" ? data.updatedAt : Date.now(),
  };
};

const saveResumeState = async (state: EmojiExportResumeState) => {
  const storage = getChromeStorage();
  if (!storage) return;
  await storage.set({ [EMOJI_EXPORT_RESUME_KEY]: state });
};

const clearResumeState = async () => {
  const storage = getChromeStorage();
  if (!storage) return;
  await storage.remove(EMOJI_EXPORT_RESUME_KEY);
};

const EmojiExportButton = ({
  disabled = false,
  showTrigger = true,
  openSignal,
}: EmojiExportButtonProps) => {
  const { state: guildState, getGuilds } = useGuildSlice();
  const guilds = guildState.guilds();
  const guildLoading = guildState.isLoading();

  const { state: userState } = useUserSlice();
  const token = userState.token();

  const { state: appState } = useAppSlice();
  const settings = appState.settings();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [instruction, setInstruction] = useState<EmojiInstruction>(
    EmojiInstruction.AWAITING_INSTRUCTION,
  );
  const [isExporting, setIsExporting] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [downloadAssets, setDownloadAssets] = useState(true);
  const [assetMode, setAssetMode] = useState<ExportAssetMode>("emoji");
  const [importedManifest, setImportedManifest] = useState<ManifestItem[]>([]);

  const abortRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleImportManifest = () => {
    if (!isExporting) {
      fileInputRef.current?.click();
    }
  };

  const handleManifestFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) {
        appendLog("Manifest must be a JSON array.", "error");
        return;
      }

      const normalized = parsed
        .map((item) => normalizeManifestItem(item))
        .filter((item): item is ManifestItem => item !== null);

      setImportedManifest(normalized);
      appendLog(`Imported ${normalized.length} manifest item(s).`, "ok");
    } catch (error) {
      console.error(error);
      appendLog("Manifest parse failed.", "error");
    }
  };

  const handleClearManifest = async () => {
    if (isExporting) return;
    setImportedManifest([]);
    try {
      await clearResumeState();
      appendLog("Manifest and resume state cleared.", "ok");
    } catch (error) {
      console.error(error);
      appendLog("Manifest cleared, but failed to clear resume state.", "error");
    }
  };

  const buildDownloadUrl = (
    type: AssetType,
    id: Snowflake,
    ext: string,
  ): { baseUrl: string; downloadUrl: string } => {
    const folder = type === "emoji" ? "emojis" : "stickers";
    const baseUrl = `https://cdn.discordapp.com/${folder}/${id}.${ext}`;

    if (ext === "json") {
      return { baseUrl, downloadUrl: baseUrl };
    }

    const url = new URL(baseUrl);
    url.searchParams.set("quality", "lossless");
    url.searchParams.set("size", type === "sticker" ? "320" : "160");
    return { baseUrl, downloadUrl: url.toString() };
  };

  const handleExportEmojis = async () => {
    if (!token || isExporting || !sortedGuilds.length) return;

    const allowed = window.confirm(
      "Export Emojis will scan all servers and may trigger many downloads. Make sure Chrome download folder settings are ready. Continue?",
    );
    if (!allowed) return;

    const noDelaySettings: AppSettings = {
      ...settings,
      [DiscrubSetting.SEARCH_DELAY]: "0",
      [DiscrubSetting.DELAY_MODIFIER]: "0",
    };

    const discordService = new DiscordService(noDelaySettings);
    let startIndex = 0;
    let resumeLoaded = false;
    let resumeRestoreCount = 0;

    const importedMap = new Map<string, ManifestItem>();
    for (const item of importedManifest) {
      if (!modeAllowsType(assetMode, item.type)) continue;
      importedMap.set(item.key, item);
    }

    try {
      const resumeState = await loadResumeState();
      if (resumeState) {
        resumeLoaded = true;
        resumeRestoreCount = resumeState.manifest.filter((item) =>
          modeAllowsType(assetMode, item.type),
        ).length;
        for (const item of resumeState.manifest) {
          if (!modeAllowsType(assetMode, item.type)) continue;
          importedMap.set(item.key, item);
        }
        if (resumeState.nextGuildId) {
          const resumeIndex = sortedGuilds.findIndex(
            (guild) => guild.id === resumeState.nextGuildId,
          );
          if (resumeIndex >= 0) {
            startIndex = resumeIndex;
          }
        }
      }
    } catch (error) {
      console.error(error);
      appendLog("Resume state read failed. Starting from first guild.", "error");
    }

    const manifest: ManifestItem[] = Array.from(importedMap.values());
    const seenKeys = new Set<string>(manifest.map((item) => item.key));

    abortRef.current = false;
    setLogs([]);
    setIsExporting(true);
    setStopRequested(false);
    setInstruction(EmojiInstruction.EXPORTING);

    appendLog(`Starting emoji export for ${sortedGuilds.length} guild(s).`);
    appendLog(
      downloadAssets
        ? "Asset download enabled (files + manifest)."
        : "Asset download disabled (manifest only).",
    );
    appendLog(
      assetMode === "both"
        ? "Asset mode: emojis + stickers."
        : assetMode === "emoji"
          ? "Asset mode: emojis only."
          : "Asset mode: stickers only.",
    );
    if (resumeLoaded) {
      appendLog(
        `Resume loaded. Restored ${resumeRestoreCount} item(s). Starting from guild ${startIndex + 1}/${sortedGuilds.length}.`,
        "ok",
      );
    }

    let downloadOk = 0;
    let downloadFail = 0;
    let newEntries = 0;

    const persistResume = async (nextIndex: number) => {
      const nextGuildId =
        nextIndex < sortedGuilds.length ? sortedGuilds[nextIndex].id : undefined;

      await saveResumeState({
        version: 1,
        nextGuildId,
        seenKeys: Array.from(seenKeys),
        manifest,
        updatedAt: Date.now(),
      });
    };

    try {
      await persistResume(startIndex);

      for (let index = startIndex; index < sortedGuilds.length; index++) {
        if (abortRef.current) break;

        const guild = sortedGuilds[index];
        appendLog(
          `Scanning guild ${index + 1}/${sortedGuilds.length}: ${guild.name}`,
        );

        let guildResponse: DiscordApiResponse<{
          name: string;
          emojis?: { id: Snowflake | Maybe; name: string | Maybe; animated?: boolean }[];
          stickers?: { id: Snowflake; name: string; format_type?: number }[];
        }>;
        try {
          guildResponse = await withTimeout(
            discordService.fetchGuildAssetData(token, guild.id),
            GUILD_FETCH_TIMEOUT_MS,
            "Guild asset request timed out.",
          );
        } catch (error) {
          console.error(error);
          appendLog(`[ERR] ${guild.name} -> guild request timeout`, "error");
          continue;
        }

        if (!guildResponse.success || !guildResponse.data) {
          const reason =
            guildResponse.status === 403
              ? "no permission"
              : "unable to fetch guild assets";
          appendLog(`[ERR] ${guild.name} -> ${reason}`, "error");
          continue;
        }

        const guildName = guildResponse.data.name || guild.name;
        const emojis = guildResponse.data.emojis || [];
        const stickers = guildResponse.data.stickers || [];

        let guildAdded = 0;
        const candidates: EmojiAssetCandidate[] = [];

        if (assetMode !== "sticker") {
          for (const emoji of emojis) {
            if (abortRef.current) break;
            if (!emoji.id) continue;

            const type: AssetType = "emoji";
            const id = emoji.id;
            const ext = emoji.animated ? "gif" : "webp";
            const key = `${type}:${id}`;
            if (seenKeys.has(key)) continue;

            const name = cleanAssetName(emoji.name || `${type}_${id}`);
            const file = `${type}_${name}_${id}.${ext}`;
            const { baseUrl, downloadUrl } = buildDownloadUrl(type, id, ext);
            candidates.push({
              type: "emoji",
              id,
              key,
              name,
              ext,
              baseUrl,
              downloadUrl,
              file,
              guildId: guild.id,
              guildName,
            });
          }
        }

        if (assetMode !== "emoji") {
          for (const sticker of stickers) {
            if (abortRef.current) break;
            if (!sticker.id) continue;

            const type: AssetType = "sticker";
            const id = sticker.id;
            const ext = getStickerExt(sticker.format_type);
            const key = `${type}:${id}`;
            if (seenKeys.has(key)) continue;

            const name = cleanAssetName(sticker.name || `${type}_${id}`);
            const file = `${type}_${name}_${id}.${ext}`;
            const { baseUrl, downloadUrl } = buildDownloadUrl(type, id, ext);
            candidates.push({
              type: "sticker",
              id,
              key,
              name,
              ext,
              baseUrl,
              downloadUrl,
              file,
              guildId: guild.id,
              guildName,
            });
          }
        }

        if (!downloadAssets) {
          for (const candidate of candidates) {
            seenKeys.add(candidate.key);
            manifest.push({
              type: candidate.type,
              id: candidate.id,
              key: candidate.key,
              name: candidate.name,
              ext: candidate.ext,
              url: candidate.baseUrl,
              file: candidate.file,
              guildId: candidate.guildId,
              guildName: candidate.guildName,
            });
            guildAdded += 1;
            newEntries += 1;
          }
        } else {
          for (
            let start = 0;
            start < candidates.length && !abortRef.current;
            start += EMOJI_DOWNLOAD_BATCH_SIZE
          ) {
            const batch = candidates.slice(start, start + EMOJI_DOWNLOAD_BATCH_SIZE);
            const batchResults = await Promise.all(
              batch.map(async (candidate) => {
                try {
                  await withTimeout(
                    downloadWithChromeApi(
                      candidate.downloadUrl,
                      `discrub-assets/${candidate.file}`,
                    ),
                    DOWNLOAD_TIMEOUT_MS,
                    "Asset download timed out.",
                  );
                  return { ok: true as const, candidate };
                } catch (error) {
                  return { ok: false as const, candidate, error };
                }
              }),
            );

            for (const result of batchResults) {
              if (result.ok) {
                const candidate = result.candidate;
                seenKeys.add(candidate.key);
                manifest.push({
                  type: candidate.type,
                  id: candidate.id,
                  key: candidate.key,
                  name: candidate.name,
                  ext: candidate.ext,
                  url: candidate.baseUrl,
                  file: candidate.file,
                  guildId: candidate.guildId,
                  guildName: candidate.guildName,
                });
                guildAdded += 1;
                newEntries += 1;
                downloadOk += 1;
              } else {
                console.error(result.error);
                appendLog(`[ERR] Download failed: ${result.candidate.file}`, "error");
                downloadFail += 1;
              }
            }
          }
        }

        appendLog(`[OK] ${guild.name} -> added ${guildAdded} new asset(s).`, "ok");
        try {
          await persistResume(index + 1);
        } catch (error) {
          console.error(error);
          appendLog("Resume state save failed for this checkpoint.", "error");
        }
      }

      if (abortRef.current) {
        appendLog("Export stopped. Progress saved for resume.", "error");
      } else {
        const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {
          type: "application/json",
        });
        const manifestName = `discord-assets-manifest-${getOsSafeString(
          new Date().toISOString().replace(/:/g, "-"),
        )}.json`;
        downloadBlob(manifestName, manifestBlob);

        appendLog(
          `Manifest downloaded (${manifest.length} total, ${newEntries} new).`,
          "ok",
        );

        if (downloadAssets) {
          appendLog(
            `Asset downloads complete. Success: ${downloadOk}, Failed: ${downloadFail}.`,
            downloadFail ? "error" : "ok",
          );
        }

        try {
          await clearResumeState();
        } catch (error) {
          console.error(error);
          appendLog("Could not clear resume state after completion.", "error");
        }
      }

      setInstruction(
        abortRef.current
          ? EmojiInstruction.OPERATION_FAILED
          : EmojiInstruction.OPERATION_COMPLETE,
      );
    } catch (error) {
      console.error(error);
      appendLog("Emoji export failed due to unexpected error.", "error");
      setInstruction(EmojiInstruction.OPERATION_FAILED);
    } finally {
      setIsExporting(false);
      setStopRequested(false);
      abortRef.current = false;
    }
  };

  const getInstructionIcon = () => {
    if (instruction === EmojiInstruction.EXPORTING) {
      return <ConstructionIcon />;
    }
    if (instruction === EmojiInstruction.OPERATION_COMPLETE) {
      return <TaskAltIcon />;
    }
    if (instruction === EmojiInstruction.OPERATION_FAILED) {
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
          Export Emojis
        </Button>
      ) : null}

      <Dialog
        hideBackdrop
        PaperProps={{ sx: { minWidth: "680px", minHeight: "540px" } }}
        open={dialogOpen}
      >
        <EnhancedDialogTitle title="Export Emojis" onClose={handleClose} />
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
                "operation-running": instruction === EmojiInstruction.EXPORTING,
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
            sx={{ width: "100%", maxWidth: 640 }}
          >
            <Typography variant="body2" color="warning.main">
              Warning: this runs on all servers and may download many files.
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

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%", maxWidth: 640 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Button
                color="secondary"
                variant="contained"
                onClick={handleImportManifest}
                disabled={isExporting}
              >
                Import Manifest
              </Button>
              <Button
                color="secondary"
                variant="outlined"
                onClick={handleClearManifest}
                disabled={isExporting}
              >
                Clear Manifest
              </Button>
              <Typography variant="body2" color="text.secondary">
                {importedManifest.length} imported item(s)
              </Typography>
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={downloadAssets}
                  onChange={(event) => setDownloadAssets(event.target.checked)}
                  disabled={isExporting}
                />
              }
              label="Download Files"
            />
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%", maxWidth: 640 }}
          >
            <Typography variant="body2" color="text.secondary">
              Asset Type
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={assetMode}
              onChange={(_, value: ExportAssetMode | null) => {
                if (!value || isExporting) return;
                setAssetMode(value);
              }}
              size="small"
            >
              <ToggleButton value="emoji">Emojis</ToggleButton>
              <ToggleButton value="sticker">Stickers</ToggleButton>
              <ToggleButton value="both">Both</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <input
            accept=".json,application/json"
            onChange={handleManifestFileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
            type="file"
          />

          <Box
            sx={{
              width: "100%",
              maxWidth: 640,
              height: 320,
              backgroundColor: "background.paper",
            }}
          >
            <FixedSizeList
              height={320}
              width={640}
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
              onClick={handleExportEmojis}
            >
              Export
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmojiExportButton;
