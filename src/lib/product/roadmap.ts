export type PhaseId = "P0" | "P1" | "P2" | "P3" | "P4" | "P5" | "P6";

export type StoryStatus = "pending" | "in_progress" | "completed";

export type Phase = {
  id: PhaseId;
  milestone: string;
  name: string;
  weeks: number;
  outcome: string;
};

export type Epic = {
  id: string;
  name: string;
  phase: string;
  points: number;
  owns: string;
};

export type Story = {
  id: string;
  phase: PhaseId;
  epic: string;
  title: string;
  status: StoryStatus;
};

export const CURRENT_PHASE: PhaseId = "P0";
export const CURRENT_MILESTONE = "M0";
export const PLANNED_WEEKS_TO_GA = 14.5;

export const phases: Phase[] = [
  {
    id: "P0",
    milestone: "M0",
    name: "Foundation",
    weeks: 1,
    outcome: "App live on Vercel with auth and an empty studio",
  },
  {
    id: "P1",
    milestone: "M1",
    name: "Capture",
    weeks: 1.5,
    outcome: "Audio upload, validation, storage, and a library row",
  },
  {
    id: "P2",
    milestone: "M2",
    name: "Hear",
    weeks: 3,
    outcome: "Monophonic audio becomes quantized note events",
  },
  {
    id: "P3",
    milestone: "M3",
    name: "Notate",
    weeks: 2.5,
    outcome: "Interactive sheet preview from Score IR / MusicXML",
  },
  {
    id: "P4",
    milestone: "M4",
    name: "Publish",
    weeks: 2,
    outcome: "PDF, Markdown, MusicXML, and MIDI exports — MVP",
  },
  {
    id: "P5",
    milestone: "M5",
    name: "Refine",
    weeks: 3,
    outcome: "Polyphonic draft, editor, and evaluation harness",
  },
  {
    id: "P6",
    milestone: "M6",
    name: "Launch",
    weeks: 1.5,
    outcome: "Legal, observability, quotas, and public GA",
  },
];

export const epics: Epic[] = [
  { id: "E1", name: "Platform foundation", phase: "P0", points: 14, owns: "Next.js, Vercel, env, CI, design tokens" },
  { id: "E2", name: "Identity and tenancy", phase: "P0", points: 8, owns: "Supabase Auth, profiles, RLS" },
  { id: "E3", name: "Audio ingest", phase: "P1", points: 13, owns: "Formats, size, Storage, metadata" },
  { id: "E4", name: "Job orchestration", phase: "P1–P2", points: 13, owns: "State machine, progress, retry" },
  { id: "E5", name: "Audio analysis", phase: "P2", points: 21, owns: "Decode, tempo, key, onset, pitch" },
  { id: "E6", name: "Score model", phase: "P3", points: 13, owns: "Score IR, MusicXML, revisions" },
  { id: "E7", name: "Sheet viewer", phase: "P3", points: 13, owns: "Render, playback, cursor" },
  { id: "E8", name: "Export and publish", phase: "P4", points: 13, owns: "PDF, Markdown, MusicXML, MIDI" },
  { id: "E9", name: "Library", phase: "P1 / P4", points: 8, owns: "List, rename, delete, search" },
  { id: "E10", name: "Quality and evaluation", phase: "P2 / P5", points: 13, owns: "Golden set, metrics, confidence" },
  { id: "E11", name: "Observability", phase: "P6", points: 5, owns: "Logs, errors, usage" },
  { id: "E12", name: "Launch readiness", phase: "P6", points: 8, owns: "Landing, legal, quotas, GA" },
];

export const stories: Story[] = [
  { id: "ORP-1", phase: "P0", epic: "E1", title: "Scaffold the Next.js monolith", status: "completed" },
  { id: "ORP-2", phase: "P0", epic: "E1", title: "Document the environment contract", status: "completed" },
  { id: "ORP-3", phase: "P0", epic: "E2", title: "Apply the initial Supabase schema", status: "completed" },
  { id: "ORP-4", phase: "P0", epic: "E2", title: "Auth session and protected studio", status: "in_progress" },
  { id: "ORP-5", phase: "P0", epic: "E1", title: "Brand shell, landing, and empty studio", status: "completed" },
  { id: "ORP-6", phase: "P0", epic: "E1", title: "Vercel project and preview deploys", status: "pending" },
  { id: "ORP-7", phase: "P0", epic: "E1", title: "Score IR types and C-major fixture", status: "completed" },
  { id: "ORP-8", phase: "P0", epic: "E1", title: "Lint and typecheck quality gate", status: "completed" },
];

export const inputFormats = [
  { ext: "mp3", label: "MP3" },
  { ext: "aac", label: "AAC" },
  { ext: "ogg", label: "OGG" },
  { ext: "flac", label: "FLAC" },
  { ext: "alac", label: "ALAC" },
  { ext: "wav", label: "WAV" },
  { ext: "aiff", label: "AIFF" },
] as const;

export const outputFormats = [
  { ext: "pdf", label: "PDF" },
  { ext: "md", label: "Markdown" },
  { ext: "musicxml", label: "MusicXML" },
  { ext: "midi", label: "MIDI" },
] as const;

export const pipelineStages = [
  { id: "listen", name: "Listen", copy: "Accept the recording and store it privately." },
  { id: "measure", name: "Measure", copy: "Find tempo, key, onsets, and pitch." },
  { id: "write", name: "Write", copy: "Quantize into a staff-shaped Score IR." },
  { id: "publish", name: "Publish", copy: "Export a page a player can read." },
] as const;
