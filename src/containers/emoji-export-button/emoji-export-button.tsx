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
  TextField,
  Typography,
} from "@mui/material";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ConstructionIcon from "@mui/icons-material/Construction";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import classNames from "classnames";
import EnhancedDialogTitle from "../../common-components/enhanced-dialog/enhanced-dialog-title.tsx";
import { useGuildSlice } from "../../features/guild/use-guild-slice.ts";
import { useUserSlice } from "../../features/user/use-user-slice.ts";
import DiscordService from "../../services/discord-service.ts";
import { useAppSlice } from "../../features/app/use-app-slice.ts";
import { nanoid } from "nanoid";
import { DiscrubSetting } from "../../enum/discrub-setting.ts";
import { AppSettings } from "../../features/app/app-types.ts";
import "../purge-button/css/purge-status-header.css";
import ArchiveWriter from "../../features/export/archive-writer.ts";
import {
  buildEmojiMetaFiles,
  buildWebsiteAssetFileName,
  type PostprocessAssetInput,
} from "./emoji-export-postprocess.ts";
import {
  finalizeDownloadedAssetBlob,
  normalizeAssetExt,
  type AssetBinaryFormat,
} from "./emoji-export-asset-format.ts";

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
  transportExt: string;
  detectedExt: string;
  finalExt: string;
  isAnimated: boolean;
  url: string;
  file: string;
  guildId: Snowflake;
  guildName: string;
};

type EmojiAssetCandidate = {
  type: AssetType;
  id: Snowflake;
  key: string;
  name: string;
  transportExt: string;
  animatedHint: boolean;
  baseUrl: string;
  downloadUrl: string;
  guildId: Snowflake;
  guildName: string;
};

type DownloadedAsset = {
  candidate: EmojiAssetCandidate;
  sourceBlob: Blob;
  transportExt: string;
  detectedExt: AssetBinaryFormat;
  finalExt: string;
  isAnimated: boolean;
  finalBlob: Blob;
  finalFile: string;
};

type ExportProgress = {
  added: number;
  downloaded: number;
  failed: number;
  processedGuilds: number;
  totalGuilds: number;
};

type EmojiExportResumeState = {
  version: 6;
  nextGuildId?: Snowflake;
  completedGuildIds?: Snowflake[];
  seenKeys: string[];
  manifest: ManifestItem[];
  generateMetaFiles: boolean;
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
const EMOJI_EXPORT_RESUME_VERSION = 6;
const GUILD_FETCH_TIMEOUT_MS = 15000;
const DOWNLOAD_TIMEOUT_MS = 12000;
const EMOJI_DOWNLOAD_BATCH_SIZE = 4;
const MIN_WORKER_COUNT = 1;
const MAX_WORKER_COUNT = 12;
const DEFAULT_WORKER_COUNT = 3;
const LOG_FLUSH_INTERVAL_MS = 80;
const RESUME_SAVE_INTERVAL_MS = 2000;
const EXPORT_FILE_PREFIX = "discord-emojis";
const EXPORT_LOG_OPERATION = "emoji-export";

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
    case 1:
      return "png";
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

const EMPTY_EXPORT_PROGRESS: ExportProgress = {
  added: 0,
  downloaded: 0,
  failed: 0,
  processedGuilds: 0,
  totalGuilds: 0,
};

const formatExportTimestamp = (date: Date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}${pad(date.getMinutes())}-${pad(
    date.getDate(),
  )}${pad(date.getMonth() + 1)}${date.getFullYear()}`;
};

const clampWorkerCount = (value: number) =>
  Math.min(MAX_WORKER_COUNT, Math.max(MIN_WORKER_COUNT, value));

const parseWorkerCount = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? clampWorkerCount(parsed) : DEFAULT_WORKER_COUNT;
};

const getErrorDetail = (error: unknown) =>
  error instanceof Error && error.message ? error.message : "unexpected error";

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
    typeof source.url !== "string" ||
    typeof source.file !== "string"
  ) {
    return null;
  }

  const normalizedType: AssetType = type === "emoji" ? "emoji" : "sticker";
  const finalExt = normalizeAssetExt(
    typeof source.finalExt === "string"
      ? source.finalExt
      : typeof source.ext === "string"
        ? source.ext
        : "",
  );
  const transportExt = normalizeAssetExt(
    typeof source.transportExt === "string"
      ? source.transportExt
      : finalExt,
  );
  const detectedExt = normalizeAssetExt(
    typeof source.detectedExt === "string"
      ? source.detectedExt
      : finalExt,
  );
  const isAnimated =
    source.isAnimated === true ||
    (typeof source.finalExt === "string"
      ? normalizeAssetExt(source.finalExt) === "gif"
      : typeof source.ext === "string" &&
        normalizeAssetExt(source.ext) === "gif");

  return {
    type: normalizedType,
    id: source.id,
    key: source.key,
    name: source.name,
    ext: finalExt,
    transportExt,
    detectedExt,
    finalExt,
    isAnimated,
    url: source.url,
    file: buildWebsiteAssetFileName(
      normalizedType,
      source.name,
      source.id,
      finalExt,
    ),
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
    data.version !== EMOJI_EXPORT_RESUME_VERSION ||
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
    version: EMOJI_EXPORT_RESUME_VERSION,
    nextGuildId:
      typeof data.nextGuildId === "string" ? data.nextGuildId : undefined,
    completedGuildIds: Array.isArray(data.completedGuildIds)
      ? data.completedGuildIds.filter(
          (id): id is Snowflake => typeof id === "string" && id.length > 0,
        )
      : [],
    seenKeys,
    manifest,
    generateMetaFiles: data.generateMetaFiles === true,
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
  const [exportProgress, setExportProgress] = useState<ExportProgress>(
    EMPTY_EXPORT_PROGRESS,
  );
  const [generateMetaFiles, setGenerateMetaFiles] = useState(false);
  const [includeStickers, setIncludeStickers] = useState(false);
  const [importedManifest, setImportedManifest] = useState<ManifestItem[]>([]);
  const [workerCountInput, setWorkerCountInput] = useState(
    String(DEFAULT_WORKER_COUNT),
  );

  const abortRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastOpenSignalRef = useRef<number | undefined>(openSignal);
  const queuedLogsRef = useRef<LogEntry[]>([]);
  const allLogsRef = useRef<string[]>([]);
  const logFlushTimerRef = useRef<number | null>(null);

  const sortedGuilds = useMemo(
    () => [...guilds].sort((a, b) => a.name.localeCompare(b.name)),
    [guilds],
  );
  const resolvedWorkerCount = useMemo(
    () => parseWorkerCount(workerCountInput),
    [workerCountInput],
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

  useEffect(() => {
    return () => {
      if (logFlushTimerRef.current !== null) {
        window.clearTimeout(logFlushTimerRef.current);
      }
    };
  }, []);

  const flushLogs = () => {
    if (!queuedLogsRef.current.length) {
      logFlushTimerRef.current = null;
      return;
    }

    const pendingLogs = [...queuedLogsRef.current].reverse();
    queuedLogsRef.current = [];
    logFlushTimerRef.current = null;

    setLogs((prevState) => [...pendingLogs, ...prevState].slice(0, LOG_LIMIT));
  };

  const appendLog = (text: string, level: LogLevel = "info") => {
    queuedLogsRef.current.push({ id: nanoid(), text, level });
    allLogsRef.current.push(text);

    if (logFlushTimerRef.current !== null) {
      return;
    }

    logFlushTimerRef.current = window.setTimeout(flushLogs, LOG_FLUSH_INTERVAL_MS);
  };

  const resetDialogState = () => {
    if (logFlushTimerRef.current !== null) {
      window.clearTimeout(logFlushTimerRef.current);
      logFlushTimerRef.current = null;
    }

    queuedLogsRef.current = [];
    allLogsRef.current = [];
    abortRef.current = false;

    setInstruction(EmojiInstruction.AWAITING_INSTRUCTION);
    setLogs([]);
    setExportProgress(EMPTY_EXPORT_PROGRESS);
    setGenerateMetaFiles(false);
    setIncludeStickers(false);
    setImportedManifest([]);
    setWorkerCountInput(String(DEFAULT_WORKER_COUNT));
    setStopRequested(false);
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
        <Typography
          variant="body2"
          sx={{
            color,
            fontFamily: "monospace",
            fontSize: "0.73rem",
            lineHeight: 1.25,
            wordBreak: "break-word",
          }}
        >
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
    resetDialogState();
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
        .filter((item): item is ManifestItem => {
          if (item === null) return false;
          if (item.type === "emoji") return true;
          return includeStickers && item.type === "sticker";
        });

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
    transportExt: string,
    animatedHint: boolean = false,
  ): { baseUrl: string; downloadUrl: string } => {
    const folder = type === "emoji" ? "emojis" : "stickers";
    const origin =
      type === "sticker"
        ? "https://media.discordapp.net"
        : "https://cdn.discordapp.com";
    const baseUrl = `${origin}/${folder}/${id}.${transportExt}`;

    if (transportExt === "json") {
      return { baseUrl, downloadUrl: baseUrl };
    }

    const url = new URL(baseUrl);
    url.searchParams.set("quality", "lossless");
    url.searchParams.set("size", type === "sticker" ? "320" : "160");
    if (type === "emoji" && animatedHint && transportExt === "webp") {
      url.searchParams.set("animated", "true");
    }
    return { baseUrl, downloadUrl: url.toString() };
  };

  const handleExportEmojis = async () => {
    if (!token || isExporting || !sortedGuilds.length) return;

    const noDelaySettings: AppSettings = {
      ...settings,
      [DiscrubSetting.SEARCH_DELAY]: "0",
      [DiscrubSetting.DELAY_MODIFIER]: "0",
    };

    const discordService = new DiscordService(noDelaySettings);
    let startIndex = 0;
    let resumeLoaded = false;
    let resumeSettingMismatch = false;
    let resumeRestoreCount = 0;
    const completedGuildIds = new Set<Snowflake>();

    const importedMap = new Map<string, ManifestItem>();
    for (const item of importedManifest) {
      if (item.type !== "emoji" && !(includeStickers && item.type === "sticker")) {
        continue;
      }
      importedMap.set(item.key, item);
    }

    try {
      const resumeState = await loadResumeState();
      if (resumeState) {
        if (resumeState.generateMetaFiles !== generateMetaFiles) {
          resumeSettingMismatch = true;
        } else {
          resumeLoaded = true;
          resumeRestoreCount = resumeState.manifest.filter((item) =>
            item.type === "emoji" || (includeStickers && item.type === "sticker"),
          ).length;
          for (const completedGuildId of resumeState.completedGuildIds || []) {
            completedGuildIds.add(completedGuildId);
          }
          for (const item of resumeState.manifest) {
            if (
              item.type !== "emoji" &&
              !(includeStickers && item.type === "sticker")
            ) {
              continue;
            }
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
      }
    } catch (error) {
      console.error(error);
      appendLog("Resume state read failed. Starting from first guild.", "error");
    }

    const manifest: ManifestItem[] = Array.from(importedMap.values());
    const seenKeys = new Set<string>(manifest.map((item) => item.key));
    const guildsToProcess = sortedGuilds.filter(
      (guild, index) => index >= startIndex && !completedGuildIds.has(guild.id),
    );
    const shouldGenerateMetaFiles = generateMetaFiles;
    const exportTimestamp = formatExportTimestamp();
    const archiveName = `${EXPORT_FILE_PREFIX}-${exportTimestamp}.zip`;
    const archiveWriter = new ArchiveWriter(archiveName);
    let archiveFinalized = false;
    let archiveQueue = Promise.resolve();
    let resumeSaveQueue = Promise.resolve();
    let latestResumeNextGuildId: Snowflake | undefined = guildsToProcess[0]?.id;
    let resumeDirty = false;
    let resumeIntervalId: number | null = null;
    let processedGuildCount = 0;
    const downloadedAssets = new Map<string, DownloadedAsset>();
    const assetArchiveDir = "resources/emoji/assets";
    const metaArchiveDir = "resources/emoji-meta";
    const archiveLogName = `logs-${EXPORT_LOG_OPERATION}-${exportTimestamp}.txt`;
    const getFinalFileName = (
      type: AssetType,
      name: string,
      id: Snowflake,
      finalExt: string,
    ) =>
      buildWebsiteAssetFileName(type, name, id, finalExt);
    const resolveDownloadedAsset = async (
      candidate: EmojiAssetCandidate,
      sourceBlob: Blob,
    ): Promise<DownloadedAsset> => {
      const finalized = await finalizeDownloadedAssetBlob(
        candidate.type,
        sourceBlob,
        candidate.transportExt,
      );

      const finalFile = getFinalFileName(
        candidate.type,
        candidate.name,
        candidate.id,
        finalized.finalExt,
      );

      return {
        candidate,
        sourceBlob,
        transportExt: candidate.transportExt,
        detectedExt: finalized.detectedExt,
        finalExt: finalized.finalExt,
        isAnimated: finalized.isAnimated,
        finalBlob: finalized.finalBlob,
        finalFile,
      };
    };
    const syncProgress = () => {
      setExportProgress({
        added: newEntries,
        downloaded: downloadOk,
        failed: downloadFail,
        processedGuilds: processedGuildCount,
        totalGuilds: guildsToProcess.length,
      });
    };

    abortRef.current = false;
    queuedLogsRef.current = [];
    allLogsRef.current = [];
    if (logFlushTimerRef.current !== null) {
      window.clearTimeout(logFlushTimerRef.current);
      logFlushTimerRef.current = null;
    }
    setLogs([]);
    setExportProgress({
      ...EMPTY_EXPORT_PROGRESS,
      totalGuilds: guildsToProcess.length,
    });
    setIsExporting(true);
    setStopRequested(false);
    setInstruction(EmojiInstruction.EXPORTING);

    appendLog(`Starting emoji export for ${guildsToProcess.length} guild(s).`);
    appendLog(`ZIP archive enabled: ${archiveName}.`);
    appendLog(
      includeStickers
        ? "Asset mode: emojis + stickers."
        : "Asset mode: emojis only.",
    );
    appendLog(
      shouldGenerateMetaFiles
        ? "Meta generation enabled. Website rename always on."
        : "Meta generation disabled. Website rename still on.",
    );
    if (resumeSettingMismatch) {
      appendLog(
        "Resume ignored because Generate Meta Files setting changed.",
        "error",
      );
    }
    if (resumeLoaded) {
      appendLog(
        `Resume loaded. Restored ${resumeRestoreCount} item(s).`,
        "ok",
      );
    }
    appendLog(
      `Guild worker pool enabled: ${Math.min(
        resolvedWorkerCount,
        guildsToProcess.length,
      )} worker(s).`,
    );

    let downloadOk = 0;
    let downloadFail = 0;
    let newEntries = 0;

    const enqueueArchiveWrite = <T,>(task: () => Promise<T>) => {
      const nextTask = archiveQueue.then(task, task);
      archiveQueue = nextTask.then(
        () => undefined,
        () => undefined,
      );
      return nextTask;
    };

    const yieldToUi = () =>
      new Promise<void>((resolve) => window.setTimeout(resolve, 0));

    const persistResume = async (nextGuildId?: Snowflake) => {
      latestResumeNextGuildId = nextGuildId;
      resumeDirty = true;
    };

    const flushResumeState = async (force: boolean = false) => {
      if (!resumeDirty && !force) {
        return;
      }

      const nextGuildId = latestResumeNextGuildId;
      resumeDirty = false;

      resumeSaveQueue = resumeSaveQueue
        .then(() =>
          saveResumeState({
            version: EMOJI_EXPORT_RESUME_VERSION,
            nextGuildId,
            completedGuildIds: Array.from(completedGuildIds),
            seenKeys: Array.from(seenKeys),
            manifest,
            generateMetaFiles,
            updatedAt: Date.now(),
          }),
        )
        .catch((error) => {
          console.error(error);
          appendLog("Resume state save failed for this checkpoint.", "error");
        });

      await resumeSaveQueue;
    };

    const markGuildProcessed = () => {
      processedGuildCount += 1;
      syncProgress();
      if (
        processedGuildCount === guildsToProcess.length ||
        processedGuildCount % 10 === 0
      ) {
        appendLog(
          `[OK] Progress: ${processedGuildCount}/${guildsToProcess.length} guilds processed, ${newEntries} new asset(s).`,
          "ok",
        );
      }
    };

    try {
      await persistResume(guildsToProcess[0]?.id);
      await flushResumeState(true);
      resumeIntervalId = window.setInterval(() => {
        void flushResumeState();
      }, RESUME_SAVE_INTERVAL_MS);
      let cursor = 0;
      const workerCount = Math.min(
        resolvedWorkerCount,
        guildsToProcess.length,
      );

      const workerTasks = Array.from({ length: workerCount }, () =>
        (async () => {
          while (!abortRef.current) {
            const index = cursor;
            cursor += 1;
            if (index >= guildsToProcess.length) {
              break;
            }

            const guild = guildsToProcess[index];
            let guildResponse: DiscordApiResponse<{
              name: string;
              emojis?: {
                id: Snowflake | Maybe;
                name: string | Maybe;
                animated?: boolean;
              }[];
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
              completedGuildIds.add(guild.id);
              markGuildProcessed();
              await persistResume(guildsToProcess[cursor]?.id);
              continue;
            }

            if (!guildResponse.success || !guildResponse.data) {
              const reason =
                guildResponse.status === 403
                  ? "no permission"
                  : "unable to fetch guild assets";
              appendLog(`[ERR] ${guild.name} -> ${reason}`, "error");
              completedGuildIds.add(guild.id);
              markGuildProcessed();
              await persistResume(guildsToProcess[cursor]?.id);
              continue;
            }

            const guildName = guildResponse.data.name || guild.name;
            const emojis = guildResponse.data.emojis || [];
            const stickers = guildResponse.data.stickers || [];

            let guildAdded = 0;
            const candidates: EmojiAssetCandidate[] = [];

            for (const emoji of emojis) {
              if (abortRef.current) break;
              if (!emoji.id) continue;

              const type: AssetType = "emoji";
              const id = emoji.id;
              const transportExt = emoji.animated ? "webp" : "png";
              const key = `${type}:${id}`;
              if (seenKeys.has(key)) continue;

              const name = cleanAssetName(emoji.name || `${type}_${id}`);
              const { baseUrl, downloadUrl } = buildDownloadUrl(
                type,
                id,
                transportExt,
                emoji.animated === true,
              );
              candidates.push({
                type: "emoji",
                id,
                key,
                name,
                transportExt,
                animatedHint: emoji.animated === true,
                baseUrl,
                downloadUrl,
                guildId: guild.id,
                guildName,
              });
            }

            if (includeStickers) {
              for (const sticker of stickers) {
                if (abortRef.current) break;
                if (!sticker.id) continue;

                const type: AssetType = "sticker";
                const id = sticker.id;
                const transportExt = getStickerExt(sticker.format_type);
                const key = `${type}:${id}`;
                if (seenKeys.has(key)) continue;

                const name = cleanAssetName(sticker.name || `${type}_${id}`);
                const { baseUrl, downloadUrl } = buildDownloadUrl(
                  type,
                  id,
                  transportExt,
                );
                candidates.push({
                  type: "sticker",
                  id,
                  key,
                  name,
                  transportExt,
                  animatedHint: transportExt === "gif",
                  baseUrl,
                  downloadUrl,
                  guildId: guild.id,
                  guildName,
                });
              }
            }

            for (
              let start = 0;
              start < candidates.length && !abortRef.current;
              start += EMOJI_DOWNLOAD_BATCH_SIZE
            ) {
              const batch = candidates.slice(
                start,
                start + EMOJI_DOWNLOAD_BATCH_SIZE,
              );
              const batchResults = await Promise.all(
                batch.map(async (candidate) => {
                  try {
                    const response = await withTimeout(
                      discordService.downloadFile(candidate.downloadUrl),
                      DOWNLOAD_TIMEOUT_MS,
                      "Asset download timed out.",
                    );
                    if (!response.success || !response.data) {
                      return {
                        ok: false as const,
                        candidate,
                        status: response.status,
                        error: response.error,
                      };
                    }
                    return { ok: true as const, candidate, data: response.data };
                  } catch (error) {
                    return {
                      ok: false as const,
                      candidate,
                      status: undefined,
                      error,
                    };
                  }
                }),
              );

              for (const result of batchResults) {
                if (result.ok) {
                  try {
                    const downloadedAsset = await resolveDownloadedAsset(
                      result.candidate,
                      result.data,
                    );
                    if (
                      downloadedAsset.finalExt !== downloadedAsset.transportExt ||
                      downloadedAsset.detectedExt !== downloadedAsset.transportExt
                    ) {
                      appendLog(
                        `[OK] Format resolved: ${result.candidate.type}_${result.candidate.name}_${result.candidate.id}.${downloadedAsset.transportExt} -> ${downloadedAsset.finalFile}`,
                        "ok",
                      );
                    }
                    await enqueueArchiveWrite(async () => {
                      await archiveWriter.addBlob(
                        downloadedAsset.finalBlob,
                        `${assetArchiveDir}/${downloadedAsset.finalFile}`,
                      );
                    });
                    downloadedAssets.set(downloadedAsset.candidate.key, downloadedAsset);
                    seenKeys.add(downloadedAsset.candidate.key);
                    manifest.push({
                      type: downloadedAsset.candidate.type,
                      id: downloadedAsset.candidate.id,
                      key: downloadedAsset.candidate.key,
                      name: downloadedAsset.candidate.name,
                      ext: downloadedAsset.finalExt,
                      transportExt: downloadedAsset.transportExt,
                      detectedExt: downloadedAsset.detectedExt,
                      finalExt: downloadedAsset.finalExt,
                      isAnimated: downloadedAsset.isAnimated,
                      url: downloadedAsset.candidate.downloadUrl,
                      file: downloadedAsset.finalFile,
                      guildId: downloadedAsset.candidate.guildId,
                      guildName: downloadedAsset.candidate.guildName,
                    });
                    guildAdded += 1;
                    newEntries += 1;
                    downloadOk += 1;
                  } catch (error) {
                    console.error(error);
                    appendLog(
                      `[ERR] Format processing failed: ${result.candidate.type}_${result.candidate.name}_${result.candidate.id}.${result.candidate.transportExt} (${getErrorDetail(
                        error,
                      )})`,
                      "error",
                    );
                    downloadFail += 1;
                  }
                } else {
                  console.error(result.error);
                  const detail =
                    typeof result.status === "number" && result.status > 0
                      ? `HTTP ${result.status}`
                      : result.error instanceof Error && result.error.message
                        ? result.error.message
                        : "request failed";
                  appendLog(
                    `[ERR] Download failed: ${result.candidate.type}_${result.candidate.name}_${result.candidate.id}.${result.candidate.transportExt} (${detail})`,
                    "error",
                  );
                  downloadFail += 1;
                }
              }

              syncProgress();
              await yieldToUi();
            }

            appendLog(
              `[OK] ${guild.name} -> added ${guildAdded} new asset(s).`,
              "ok",
            );
            completedGuildIds.add(guild.id);
            markGuildProcessed();
            try {
              await persistResume(guildsToProcess[cursor]?.id);
            } catch (error) {
              console.error(error);
            }
          }
        })(),
      );

      await Promise.all(workerTasks);

      if (!abortRef.current) {
        const missingGuildCount = guildsToProcess.filter(
          (guild) => !completedGuildIds.has(guild.id),
        ).length;
        if (missingGuildCount > 0) {
          appendLog(
            `[ERR] Verification failed: ${missingGuildCount} guild(s) not processed.`,
            "error",
          );
        } else {
          appendLog("[OK] Verification passed: all scheduled guilds processed.", "ok");
        }
      }

      if (abortRef.current) {
        appendLog("Export stopped. Progress saved for resume.", "error");
        await flushResumeState(true);
        await enqueueArchiveWrite(async () => {
          await archiveWriter.addText(
            JSON.stringify(manifest, null, 2),
            shouldGenerateMetaFiles
              ? `${metaArchiveDir}/${EXPORT_FILE_PREFIX}-manifest-partial.json`
              : `${EXPORT_FILE_PREFIX}-manifest-partial.json`,
          );
          await archiveWriter.addText(
            `${allLogsRef.current.join("\n")}\n`,
            archiveLogName,
          );
        });
        await archiveQueue;
        await archiveWriter.close();
        archiveFinalized = true;
        appendLog(
          `Partial archive downloaded (${manifest.length} total, ${newEntries} new).`,
          "ok",
        );
      } else {
        await flushResumeState(true);
        await enqueueArchiveWrite(async () => {
          if (shouldGenerateMetaFiles) {
            const metaFiles = await buildEmojiMetaFiles(
              manifest,
              Array.from(downloadedAssets.values()).map((asset) => asset.finalFile),
              Array.from(downloadedAssets.values()).map(
                ({ candidate, finalExt, transportExt, isAnimated }): PostprocessAssetInput => ({
                  type: candidate.type,
                  id: candidate.id,
                  name: candidate.name,
                  ext: finalExt,
                  originalFile: `${candidate.type}_${candidate.name}_${candidate.id}.${transportExt}`,
                  isAnimated,
                }),
              ),
            );

            await archiveWriter.addText(
              metaFiles.manifestJson,
              `${metaArchiveDir}/${EXPORT_FILE_PREFIX}-manifest.json`,
            );
            await archiveWriter.addText(
              metaFiles.manifestJs,
              `${metaArchiveDir}/${EXPORT_FILE_PREFIX}-manifest.js`,
            );
            await archiveWriter.addText(
              metaFiles.existingFilesJs,
              `${metaArchiveDir}/${EXPORT_FILE_PREFIX}-existing-files.js`,
            );
            await archiveWriter.addText(
              metaFiles.animatedWebpJs,
              `${metaArchiveDir}/${EXPORT_FILE_PREFIX}-animated-webp.js`,
            );
            await archiveWriter.addText(
              metaFiles.manifestJson,
              `${EXPORT_FILE_PREFIX}-manifest-${manifest.length}-${exportTimestamp}.json`,
            );
          } else {
            await archiveWriter.addText(
              JSON.stringify(manifest, null, 2),
              `${EXPORT_FILE_PREFIX}-manifest.json`,
            );
          }
          await archiveWriter.addText(
            `${allLogsRef.current.join("\n")}\n`,
            archiveLogName,
          );
        });
        await archiveQueue;
        await archiveWriter.close();
        archiveFinalized = true;
        appendLog(
          `Archive downloaded (${manifest.length} total, ${newEntries} new).`,
          "ok",
        );

        if (shouldGenerateMetaFiles) {
          appendLog("Website rename applied to exported asset filenames.", "ok");
          appendLog("Meta files generated and added to archive.", "ok");
        }
        appendLog(
          `Asset downloads complete. Success: ${downloadOk}, Failed: ${downloadFail}.`,
          downloadFail ? "error" : "ok",
        );

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
      appendLog(
        `Emoji export failed due to unexpected error: ${getErrorDetail(error)}.`,
        "error",
      );
      setInstruction(EmojiInstruction.OPERATION_FAILED);
    } finally {
      if (resumeIntervalId !== null) {
        window.clearInterval(resumeIntervalId);
      }
      await resumeSaveQueue;
      if (!archiveFinalized) {
        try {
          await archiveQueue;
          await archiveWriter.close();
        } catch (error) {
          console.error(error);
        }
      }
      flushLogs();
      syncProgress();
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
        sx={{
          zIndex: 2600,
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            justifyContent: "center",
            pt: 1,
            pb: 1,
            overflow: "visible",
          },
        }}
        PaperProps={{
          sx: {
            width: "min(640px, calc(100vw - 24px))",
            minWidth: "min(640px, calc(100vw - 24px))",
            height: "min(620px, calc(100vh - 16px))",
            minHeight: "min(620px, calc(100vh - 16px))",
            maxHeight: "min(620px, calc(100vh - 16px))",
            m: 0,
            overflow: "hidden",
            zIndex: 2601,
            display: "flex",
            flexDirection: "column",
          },
        }}
        open={dialogOpen}
      >
        <EnhancedDialogTitle title="Export Emojis" onClose={handleClose} />
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "stretch",
            height: "100%",
            minHeight: 0,
            overflowY: "hidden",
            overflowX: "hidden",
            pb: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
              alignItems: "center",
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              pr: 0.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 0.5,
                mt: 0.25,
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
              alignItems="flex-start"
              justifyContent="space-between"
              gap={1.5}
              sx={{ width: "100%", maxWidth: 640, flexWrap: "wrap", rowGap: 1 }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1} flexWrap="wrap">
                <Stack spacing={0.5} sx={{ minWidth: 132 }}>
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={handleImportManifest}
                    disabled={isExporting}
                  >
                    Import Manifest
                  </Button>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ pl: 0.5 }}
                  >
                    {importedManifest.length} imported item(s)
                  </Typography>
                </Stack>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={handleClearManifest}
                  disabled={isExporting}
                >
                  Clear Manifest
                </Button>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ flexWrap: "wrap", rowGap: 0.5, justifyContent: "flex-end" }}
              >
                <Typography variant="body2" color="text.secondary">
                  Workers
                </Typography>
                <TextField
                  value={workerCountInput}
                  onChange={(event) => setWorkerCountInput(event.target.value)}
                  onBlur={() =>
                    setWorkerCountInput(String(parseWorkerCount(workerCountInput)))
                  }
                  disabled={isExporting}
                  size="small"
                  type="number"
                  inputProps={{
                    min: MIN_WORKER_COUNT,
                    max: MAX_WORKER_COUNT,
                    step: 1,
                    inputMode: "numeric",
                  }}
                  sx={{
                    width: 84,
                    "& .MuiInputBase-input": {
                      py: 0.75,
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Recommended: 1-8
                </Typography>
              </Stack>
            </Stack>

            <Stack
              sx={{ width: "100%", maxWidth: 640, gap: 0.25 }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                sx={{ flexWrap: "wrap" }}
              >
                <FormControlLabel
                  sx={{ ml: 0, mr: 0 }}
                  control={
                    <Checkbox
                      checked={generateMetaFiles}
                      onChange={(event) =>
                        setGenerateMetaFiles(event.target.checked)
                      }
                      disabled={isExporting}
                    />
                  }
                  label="Generate Meta Files"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    flex: 1,
                    minWidth: 220,
                    textAlign: { xs: "left", sm: "right" },
                    whiteSpace: { xs: "normal", sm: "nowrap" },
                  }}
                >
                  Creates a JSON file for website asset categorization.
                </Typography>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                sx={{ flexWrap: "wrap" }}
              >
                <FormControlLabel
                  sx={{ ml: 0, mr: 0 }}
                  control={
                    <Checkbox
                      checked={includeStickers}
                      onChange={(event) => setIncludeStickers(event.target.checked)}
                      disabled={isExporting}
                    />
                  }
                  label="Include Stickers"
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ flex: 1, minWidth: 200, textAlign: { xs: "left", sm: "right" } }}
                >
                  {includeStickers ? "Asset type: emojis + stickers." : "Asset type: emojis only."}
                </Typography>
              </Stack>
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
                height: 265,
                backgroundColor: "background.paper",
                borderRadius: 1,
                overflow: "hidden",
                flexShrink: 0,
                minHeight: 265,
                mt: 0.5,
              }}
            >
              <FixedSizeList
                height={265}
                width="100%"
                itemSize={32}
                itemCount={logs.length}
              >
                {getLogRow}
              </FixedSizeList>
            </Box>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: "100%", mt: 1, flexShrink: 0, pb: 0.5, gap: 1 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flex: 1, minWidth: 0 }}
            >
              Added {exportProgress.added} new assets. Downloaded {exportProgress.downloaded}. Failed {exportProgress.failed}. Guilds {exportProgress.processedGuilds}/{exportProgress.totalGuilds}.
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
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
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmojiExportButton;
