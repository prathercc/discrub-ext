import { GIFEncoder, applyPalette, quantize } from "gifenc";

export type AssetBinaryFormat = "png" | "gif" | "webp" | "json" | "unknown";
export type ExportAssetType = "emoji" | "sticker";

export type SniffedAssetInfo = {
  detectedExt: AssetBinaryFormat;
  isAnimated: boolean;
  frameCount: number;
};

export type FinalizedAssetInfo = {
  detectedExt: AssetBinaryFormat;
  finalExt: AssetBinaryFormat;
  isAnimated: boolean;
  finalBlob: Blob;
};

const normalizeAssetExt = (ext: string) =>
  String(ext || "").replace(/^\.+/, "").toLowerCase();

const hasRiffWebpHeader = (bytes: Uint8Array) =>
  bytes.length >= 12 &&
  bytes[0] === 0x52 &&
  bytes[1] === 0x49 &&
  bytes[2] === 0x46 &&
  bytes[3] === 0x46 &&
  bytes[8] === 0x57 &&
  bytes[9] === 0x45 &&
  bytes[10] === 0x42 &&
  bytes[11] === 0x50;

const countAnimatedWebpFrames = (bytes: Uint8Array) => {
  if (!hasRiffWebpHeader(bytes)) return 0;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let frameCount = 0;
  for (let offset = 12; offset + 8 <= bytes.byteLength; ) {
    const fourCC = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3],
    );
    const chunkSize = view.getUint32(offset + 4, true);
    if (fourCC === "ANMF") {
      frameCount += 1;
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }

  return frameCount;
};

export const detectAnimatedWebpBytes = (bytes: Uint8Array) => {
  return countAnimatedWebpFrames(bytes) > 1;
};

export const detectAnimatedWebp = async (blob: Blob) =>
  detectAnimatedWebpBytes(new Uint8Array(await blob.arrayBuffer()));

const countGifFrames = (bytes: Uint8Array) => {
  if (
    bytes.length < 6 ||
    bytes[0] !== 0x47 ||
    bytes[1] !== 0x49 ||
    bytes[2] !== 0x46 ||
    bytes[3] !== 0x38 ||
    (bytes[4] !== 0x37 && bytes[4] !== 0x39) ||
    bytes[5] !== 0x61
  ) {
    return 0;
  }

  let frameCount = 0;
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === 0x2c) {
      frameCount += 1;
    }
  }

  return frameCount;
};

const countPngFrames = (bytes: Uint8Array) => {
  if (
    bytes.length < 8 ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47 ||
    bytes[4] !== 0x0d ||
    bytes[5] !== 0x0a ||
    bytes[6] !== 0x1a ||
    bytes[7] !== 0x0a
  ) {
    return 0;
  }

  let declaredFrameCount = 0;
  let frameControlCount = 0;
  for (let offset = 8; offset + 8 <= bytes.byteLength; ) {
    const chunkLength =
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3];
    const chunkType = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    );
    if (chunkType === "acTL" && chunkLength >= 4) {
      declaredFrameCount =
        (bytes[offset + 8] << 24) |
        (bytes[offset + 9] << 16) |
        (bytes[offset + 10] << 8) |
        bytes[offset + 11];
    } else if (chunkType === "fcTL") {
      frameControlCount += 1;
    }
    offset += 12 + chunkLength;
  }

  return Math.max(declaredFrameCount, frameControlCount);
};

export const sniffAssetInfo = async (
  blob: Blob,
  fallbackExt: string,
): Promise<SniffedAssetInfo> => {
  const normalizedFallback = normalizeAssetExt(fallbackExt);

  if (
    normalizedFallback === "json" ||
    blob.type.includes("json") ||
    blob.type.includes("lottie")
  ) {
    return { detectedExt: "json", isAnimated: false, frameCount: 0 };
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    const frameCount = countPngFrames(bytes);
    return {
      detectedExt: "png",
      isAnimated: frameCount > 1,
      frameCount,
    };
  }

  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    const frameCount = countGifFrames(bytes);
    return {
      detectedExt: "gif",
      isAnimated: frameCount > 1,
      frameCount,
    };
  }

  if (hasRiffWebpHeader(bytes)) {
    const frameCount = countAnimatedWebpFrames(bytes);
    return {
      detectedExt: "webp",
      isAnimated: frameCount > 1,
      frameCount,
    };
  }

  return {
    detectedExt: normalizedFallback as AssetBinaryFormat,
    isAnimated: false,
    frameCount: 0,
  };
};

const getImageDecoder = () => (globalThis as { ImageDecoder?: unknown }).ImageDecoder;

const createFrameCanvas = (width: number, height: number) => {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const encodeCanvasToPng = async (
  canvas: OffscreenCanvas | HTMLCanvasElement,
) => {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type: "image/png" });
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Could not encode PNG output."));
    }, "image/png");
  });
};

const frameDurationToMs = (duration?: number | null) => {
  if (!duration || duration <= 0) return 100;
  return Math.max(20, Math.round(duration / 1000));
};

const buildGifFrame = (
  rgba: Uint8ClampedArray,
  hasTransparency: boolean,
) => {
  if (!hasTransparency) {
    const palette = quantize(rgba, 256);
    return {
      palette,
      index: applyPalette(rgba, palette),
      transparent: false,
    };
  }

  const palette = quantize(rgba, 255, {
    format: "rgba4444",
    oneBitAlpha: 127,
    clearAlpha: true,
    clearAlphaThreshold: 127,
  }).filter((color: number[]) => color[3] !== 0);

  const paletted = [[0, 0, 0, 0], ...palette];

  return {
    palette: paletted,
    index: applyPalette(rgba, paletted, "rgba4444"),
    transparent: true,
  };
};

const hasTransparentPixels = (rgba: Uint8ClampedArray) => {
  for (let index = 3; index < rgba.length; index += 4) {
    if (rgba[index] < 250) {
      return true;
    }
  }

  return false;
};

const drawDecodedFrame = async (
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  frame: CanvasImageSource,
  width: number,
  height: number,
) => {
  context.clearRect(0, 0, width, height);

  try {
    context.drawImage(frame, 0, 0, width, height);
    return;
  } catch (error) {
    if (typeof createImageBitmap !== "function") {
      throw error;
    }

    const bitmap = await createImageBitmap(frame as ImageBitmapSource);
    try {
      context.drawImage(bitmap, 0, 0, width, height);
    } finally {
      bitmap.close?.();
    }
  }
};

export const convertAnimatedImageToGif = async (
  blob: Blob,
  detectedExt: AssetBinaryFormat,
  expectedFrameCount?: number,
) => {
  const ImageDecoderCtor = getImageDecoder() as
    | {
        new (options: { data: Uint8Array; type: string }): {
          tracks?: {
            selectedTrack?: {
              frameCount?: number;
              repetitionCount?: number;
            };
          };
          decode(options: {
            frameIndex: number;
            completeFramesOnly?: boolean;
          }): Promise<{
            image: {
              displayWidth: number;
              displayHeight: number;
              codedWidth: number;
              codedHeight: number;
              duration?: number | null;
              close?: () => void;
            };
            complete: boolean;
          }>;
          close?: () => void;
        };
        isTypeSupported?: (type: string) => Promise<boolean>;
      }
    | undefined;

  if (!ImageDecoderCtor) {
    throw new Error("ImageDecoder is unavailable in this browser.");
  }

  const mimeType =
    detectedExt === "webp"
      ? "image/webp"
      : detectedExt === "png"
        ? "image/png"
        : null;

  if (!mimeType) {
    throw new Error(`Cannot convert ${detectedExt} to GIF.`);
  }

  if (typeof ImageDecoderCtor.isTypeSupported === "function") {
    const supported = await ImageDecoderCtor.isTypeSupported(mimeType);
    if (!supported) {
      throw new Error(`ImageDecoder does not support ${mimeType}.`);
    }
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  const decoder = new ImageDecoderCtor({ data: bytes, type: mimeType });
  const track = decoder.tracks?.selectedTrack;
  const frameCount = Math.max(expectedFrameCount || 0, 1);

  if (frameCount <= 1) {
    decoder.close?.();
    throw new Error(`Expected an animated ${detectedExt} image.`);
  }

  const firstDecode = await decoder.decode({
    frameIndex: 0,
    completeFramesOnly: true,
  });
  const firstFrame = firstDecode.image;
  const width = firstFrame.displayWidth || firstFrame.codedWidth;
  const height = firstFrame.displayHeight || firstFrame.codedHeight;
  const canvas = createFrameCanvas(width, height);
  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

  if (!context) {
    firstFrame.close?.();
    decoder.close?.();
    throw new Error("Could not acquire a 2D canvas context for GIF conversion.");
  }

  const gif = GIFEncoder();
  const repeat = typeof track?.repetitionCount === "number" ? track.repetitionCount : 0;

  const writeFrame = async (
    frame: typeof firstFrame,
    frameIndex: number,
  ) => {
    await drawDecodedFrame(
      context,
      frame as unknown as CanvasImageSource,
      width,
      height,
    );
    const imageData = context.getImageData(0, 0, width, height);
    const transparent = hasTransparentPixels(imageData.data);
    const encodedFrame = buildGifFrame(imageData.data, transparent);
    gif.writeFrame(encodedFrame.index, width, height, {
      palette: encodedFrame.palette,
      delay: frameDurationToMs(frame.duration),
      repeat: frameIndex === 0 ? repeat : undefined,
      transparent: encodedFrame.transparent,
      transparentIndex: 0,
    });
  };

  try {
    await writeFrame(firstFrame, 0);
  } finally {
    firstFrame.close?.();
  }

  for (let frameIndex = 1; frameIndex < frameCount; frameIndex += 1) {
    const decoded = await decoder.decode({
      frameIndex,
      completeFramesOnly: true,
    });
    try {
      await writeFrame(decoded.image, frameIndex);
    } finally {
      decoded.image.close?.();
    }
  }

  gif.finish();
  decoder.close?.();
  return new Blob([gif.bytes()], { type: "image/gif" });
};

export const convertStaticImageToPng = async (blob: Blob) => {
  if (typeof createImageBitmap !== "function") {
    throw new Error("createImageBitmap is unavailable in this browser.");
  }

  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = createFrameCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d") as
      | OffscreenCanvasRenderingContext2D
      | CanvasRenderingContext2D
      | null;

    if (!context) {
      throw new Error("Could not acquire a 2D canvas context for PNG conversion.");
    }

    context.clearRect(0, 0, bitmap.width, bitmap.height);
    context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
    return await encodeCanvasToPng(canvas);
  } finally {
    bitmap.close?.();
  }
};

export const finalizeDownloadedAssetBlob = async (
  type: ExportAssetType,
  sourceBlob: Blob,
  transportExt: string,
): Promise<FinalizedAssetInfo> => {
  const sniffed = await sniffAssetInfo(sourceBlob, transportExt);
  let finalBlob = sourceBlob;
  let finalExt = sniffed.detectedExt;
  let isAnimated = sniffed.isAnimated;

  if (
    sniffed.isAnimated &&
    sniffed.detectedExt !== "gif" &&
    sniffed.detectedExt !== "json" &&
    sniffed.detectedExt !== "unknown"
  ) {
    finalBlob = await convertAnimatedImageToGif(
      sourceBlob,
      sniffed.detectedExt,
      sniffed.frameCount,
    );
    finalExt = "gif";
    isAnimated = true;
  } else if (
    !sniffed.isAnimated &&
    sniffed.detectedExt !== "png" &&
    sniffed.detectedExt !== "json" &&
    sniffed.detectedExt !== "unknown"
  ) {
    finalBlob = await convertStaticImageToPng(sourceBlob);
    finalExt = "png";
    isAnimated = false;
  }

  if (type === "sticker" && sniffed.detectedExt === "json") {
    finalExt = "json";
    isAnimated = false;
  }

  return {
    detectedExt: sniffed.detectedExt,
    finalExt,
    isAnimated,
    finalBlob,
  };
};

export { normalizeAssetExt };
