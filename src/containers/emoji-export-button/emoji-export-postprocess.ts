import { normalizeAssetExt } from "./emoji-export-asset-format.ts";

export type PostprocessAssetInput = {
  type: "emoji" | "sticker";
  id: Snowflake;
  name: string;
  ext: string;
  originalFile: string;
  isAnimated: boolean;
};

export type EmojiMetaManifestRow = {
  type: "emoji" | "sticker";
  id: Snowflake;
  name: string;
  ext: string;
  file: string;
  url: string;
};

export type MetaOutput = {
  manifestJson: string;
  manifestJs: string;
  existingFilesJs: string;
  animatedWebpJs: string;
};

const slugify = (value: string) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase() || "asset";

const writeAssignment = (variableName: string, value: unknown) =>
  `window.${variableName} = ${JSON.stringify(value, null, 2)};\n`;

export const buildWebsiteAssetFileName = (
  type: "emoji" | "sticker",
  name: string,
  id: Snowflake,
  ext: string,
) => `${type}_${slugify(name)}_www.centrala.lgbt_${id}.${normalizeAssetExt(ext)}`;

export const buildEmojiMetaFiles = async (
  manifest: EmojiMetaManifestRow[],
  renamedFiles: string[],
  assets: PostprocessAssetInput[],
): Promise<MetaOutput> => {
  const existingFiles = [...renamedFiles].sort((a, b) =>
    a.localeCompare(b, "en"),
  );
  const animatedWebpFiles: string[] = [];

  for (const asset of assets) {
    if (!asset.isAnimated) continue;
    animatedWebpFiles.push(
      buildWebsiteAssetFileName(asset.type, asset.name, asset.id, asset.ext),
    );
  }

  animatedWebpFiles.sort((a, b) => a.localeCompare(b, "en"));

  return {
    manifestJson: `${JSON.stringify(manifest, null, 2)}\n`,
    manifestJs: writeAssignment("__CENTRALA_EMOJI_MANIFEST", manifest),
    existingFilesJs: writeAssignment(
      "__CENTRALA_EMOJI_EXISTING_FILES",
      existingFiles,
    ),
    animatedWebpJs: writeAssignment(
      "__CENTRALA_ANIMATED_WEBP_FILES",
      animatedWebpFiles,
    ),
  };
};
