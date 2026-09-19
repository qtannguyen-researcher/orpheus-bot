export const DEFAULT_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Extensions Orpheus accepts. `.acc` is a common misspelling of AAC. */
export const AUDIO_EXTENSIONS = [
  "mp3",
  "aac",
  "acc",
  "m4a",
  "ogg",
  "oga",
  "flac",
  "alac",
  "wav",
  "wave",
  "aiff",
  "aif",
  "caf",
] as const;

export type AudioExtension = (typeof AUDIO_EXTENSIONS)[number];

export const AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/aac",
  "audio/x-aac",
  "audio/mp4",
  "audio/x-mp4",
  "audio/mp4a-latm",
  "audio/m4a",
  "audio/x-m4a",
  "video/mp4",
  "audio/ogg",
  "audio/flac",
  "audio/x-flac",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/aiff",
  "audio/x-aiff",
  "audio/x-caf",
] as const;

const EXTENSION_SET = new Set<string>(AUDIO_EXTENSIONS);
const MIME_SET = new Set<string>(AUDIO_MIME_TYPES);

export type UploadRejection =
  | { ok: true; extension: AudioExtension }
  | { ok: false; code: "EMPTY" | "TOO_LARGE" | "TYPE"; message: string };

export function extensionOf(filename: string): string {
  const base = filename.trim().toLowerCase();
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot + 1) : "";
}

export function isAllowedAudioFilename(filename: string): boolean {
  return EXTENSION_SET.has(extensionOf(filename));
}

export function isAllowedAudioMime(mime: string | undefined): boolean {
  if (!mime) return false;
  return MIME_SET.has(mime.toLowerCase());
}

export function validateUpload(input: {
  filename: string;
  byteSize: number;
  mime?: string;
  maxBytes?: number;
}): UploadRejection {
  const maxBytes = input.maxBytes ?? DEFAULT_MAX_UPLOAD_BYTES;

  if (!input.filename || input.byteSize <= 0) {
    return { ok: false, code: "EMPTY", message: "Choose an audio file before uploading." };
  }

  if (input.byteSize > maxBytes) {
    const mb = Math.floor(maxBytes / (1024 * 1024));
    return {
      ok: false,
      code: "TOO_LARGE",
      message: `That file is ${formatBytes(input.byteSize)}. Orpheus accepts up to ${mb} MB until chunking ships.`,
    };
  }

  const extension = extensionOf(input.filename);
  const nameOk = EXTENSION_SET.has(extension);
  const mimeOk = !input.mime || input.mime === "application/octet-stream" || isAllowedAudioMime(input.mime);

  if (!nameOk || !mimeOk) {
    return {
      ok: false,
      code: "TYPE",
      message: "Orpheus reads mp3, aac, m4a, ogg, flac, alac, wav, and aiff. .acc is accepted as an AAC alias.",
    };
  }

  return { ok: true, extension: extension as AudioExtension };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
