export const TRANSCRIPTION_STATUSES = [
  "uploaded",
  "queued",
  "analyzing",
  "transcribing",
  "notating",
  "ready",
  "failed",
  "canceled",
] as const;

export type TranscriptionStatus = (typeof TRANSCRIPTION_STATUSES)[number];

const TRANSITIONS: Record<TranscriptionStatus, readonly TranscriptionStatus[]> = {
  uploaded: ["queued", "canceled"],
  queued: ["analyzing", "failed", "canceled"],
  analyzing: ["transcribing", "failed", "canceled"],
  transcribing: ["notating", "failed", "canceled"],
  notating: ["ready", "failed", "canceled"],
  ready: ["notating", "queued"],
  failed: ["queued"],
  canceled: ["queued"],
};

export const MAX_TRANSCRIPTION_ATTEMPTS = 3;

export function canTransition(from: TranscriptionStatus, to: TranscriptionStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transition(
  from: TranscriptionStatus,
  to: TranscriptionStatus,
): TranscriptionStatus {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal transcription transition: ${from} → ${to}`);
  }
  return to;
}

export function isTerminal(status: TranscriptionStatus): boolean {
  return status === "ready" || status === "canceled";
}

export function canRetry(status: TranscriptionStatus, attemptCount: number): boolean {
  return status === "failed" && attemptCount < MAX_TRANSCRIPTION_ATTEMPTS;
}
