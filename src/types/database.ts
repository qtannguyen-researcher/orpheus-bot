import type { TranscriptionStatus } from "@/lib/jobs/machine";
import type { ScoreIR } from "@/lib/score/ir";

export type Profile = {
  id: string;
  display_name: string | null;
  created_at: string;
};

export type Transcription = {
  id: string;
  owner_id: string;
  title: string;
  status: TranscriptionStatus;
  source_filename: string;
  source_format: string;
  byte_size: number;
  duration_ms: number | null;
  sample_rate: number | null;
  channels: number | null;
  storage_path: string;
  error_code: string | null;
  error_message: string | null;
  attempt_count: number;
  created_at: string;
  updated_at: string;
};

export type ScoreRevision = {
  id: string;
  transcription_id: string;
  ir: ScoreIR;
  musicxml: string | null;
  key_signature: string | null;
  time_signature: string | null;
  tempo_bpm: number | null;
  engine: string;
  engine_version: string;
  created_at: string;
};

export type ExportFormat = "pdf" | "md" | "musicxml" | "midi";

export type ScoreExport = {
  id: string;
  transcription_id: string;
  format: ExportFormat;
  storage_path: string;
  byte_size: number | null;
  created_at: string;
};
